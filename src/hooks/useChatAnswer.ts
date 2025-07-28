"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAnswer,
  addMessage,
  updateMessage,
  selectChatThread,
} from "@/store/chatSlice";
import { Chat as ChatType, ChatThread, Message } from "../utils/types";
import { getInitialMessages } from "../utils/utils";
import { selectUserDetailsState } from "@/store/authSlice";
import { selectAI } from "@/store/aiSlice";
import { store } from "@/store/store";
import { doc, updateDoc } from "@firebase/firestore";
import { db } from "../../firebaseConfig";

type UseChatAnswerProps = {
  threadId: string;
  chatThread: ChatThread;
  setError: (error: string) => void;
  setErrorFunction: (fn: (() => Promise<any>) | null) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsCompleted: (isCompleted: boolean) => void;
};

const useChatAnswer = ({
  threadId,
  chatThread,
  setError,
  setErrorFunction,
  setIsStreaming,
  setIsLoading,
  setIsCompleted,
}: UseChatAnswerProps) => {
  const dispatch = useDispatch();
  const userDetails = useSelector(selectUserDetailsState);
  const ai = useSelector(selectAI);
  const userId = userDetails.uid;

  const [controller, setController] = useState<AbortController | null>(null);

  const handleSave = async () => {
    try {
      const updatedState = store.getState();
      const updatedChatThread = selectChatThread(updatedState, threadId);
      const updatedChats = updatedChatThread?.chats || [];
      const updatedMessages = updatedChatThread?.messages || [];

      if (userId && updatedChats && updatedMessages) {
        const chatThreadRef = doc(db, "users", userId, "history", threadId);
        await updateDoc(chatThreadRef, {
          messages: updatedMessages,
          chats: updatedChats,
        });
      }
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };

  const handleAnswer = async (chat: ChatType, data?: string) => {
    const abortCtrl = new AbortController();
    setController(abortCtrl);

    setIsLoading(true);
    setIsCompleted(false);

    const messages = getInitialMessages(chat, data);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortCtrl.signal,
        body: JSON.stringify({
          messages,
          model: chat?.mode === "image" ? "gpt-4o" : ai.model,
          temperature: ai.temperature,
          max_tokens: ai.maxLength,
          top_p: ai.topP,
          frequency_penalty: ai.frequency,
          presence_penalty: ai.presence,
        }),
      });

      if (!response.ok) {
        setError("Something went wrong. Please try again later.");
        // FIX: Removed extra function wrapper
        setErrorFunction(() => handleAnswer(chat, data));
        return;
      }

      setError("");
      setIsLoading(false);
      setIsStreaming(true);

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";

        while (true) {
          const { value, done } = await reader.read();
          answer += decoder.decode(value);
          dispatch(
            updateAnswer({
              threadId,
              chatIndex: chatThread.chats.length - 1,
              answer,
            })
          );
          if (done) break;
        }

        dispatch(
          addMessage({
            threadId,
            message: { role: "assistant", content: answer },
          })
        );
        setIsCompleted(true);
        handleSave();
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        await handleSave();
      } else {
        console.error("Error during handleAnswer:", error);
        setError("Something went wrong. Please try again later.");
        // FIX: Removed extra function wrapper
        setErrorFunction(() => handleAnswer(chat, data));
      }
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      setController(null);
    }
  };

  const handleRewrite = async () => {
    if (!chatThread.chats.length || !chatThread.chats.at(-1)?.answer) return;

    const abortCtrl = new AbortController();
    setController(abortCtrl);

    setIsLoading(true);
    setIsCompleted(false);

    const lastChat = chatThread.chats.at(-1)!;
    const lastUserMessage = chatThread.messages.findLast(
      (msg) => msg.role === "user"
    );

    const messages: Message[] = [];

    const systemMessage = chatThread.messages.find(
      (msg) => msg.role === "system"
    );
    if (systemMessage) messages.push(systemMessage);

    chatThread.chats.slice(0, -1).forEach((c) => {
      messages.push({ role: "user", content: c.question });
      if (c.answer) {
        messages.push({ role: "assistant", content: c.answer });
      }
    });

    messages.push({
      role: "user",
      content: lastUserMessage?.content ?? lastChat.question,
    });

    if (ai.customPrompt.length > 0) {
      messages.splice(messages.length - 1, 0, {
        role: "system",
        content: ai.customPrompt,
      });
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortCtrl.signal,
        body: JSON.stringify({
          messages,
          model: lastChat.mode === "image" ? "gpt-4o" : ai.model,
          temperature: ai.temperature,
          max_tokens: ai.maxLength,
          top_p: ai.topP,
          frequency_penalty: ai.frequency,
          presence_penalty: ai.presence,
        }),
      });

      if (!response.ok) {
        setError("Something went wrong. Please try again later.");
        // FIX: Removed extra function wrapper
        setErrorFunction(handleRewrite);
        return;
      }

      setError("");
      setIsLoading(false);
      setIsStreaming(true);

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";

        while (true) {
          const { value, done } = await reader.read();
          answer += decoder.decode(value);
          dispatch(
            updateAnswer({
              threadId,
              chatIndex: chatThread.chats.length - 1,
              answer,
            })
          );
          if (done) break;
        }

        const lastAssistantIndex = chatThread.messages.findLastIndex(
          (msg) => msg.role === "assistant"
        );

        if (lastAssistantIndex !== -1) {
          dispatch(
            updateMessage({
              threadId,
              messageIndex: lastAssistantIndex,
              message: { role: "assistant", content: answer },
            })
          );
        }

        setIsCompleted(true);
        handleSave();
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        await handleSave();
      } else {
        console.error("Error during handleRewrite:", error);
        setError("Something went wrong. Please try again later.");
        setErrorFunction(handleRewrite);
      }
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      setController(null);
    }
  };

  const handleCancel = () => {
    controller?.abort();
    setIsStreaming(false);
  };

  return {
    handleAnswer,
    handleRewrite,
    handleCancel,
  };
};

export default useChatAnswer;