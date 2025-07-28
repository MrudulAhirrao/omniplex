import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { collection, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { addChatThread, selectChatThread } from "@/store/chatSlice";
import { RootState } from "@/store/store";
import { selectUserDetailsState } from "@/store/authSlice";
import { useCallback } from "react";

const useChatFork = (threadId: string) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const chatThread = useSelector((state: RootState) =>
    selectChatThread(state, threadId)
  );
  const { uid: userId } = useSelector(selectUserDetailsState);

  const handleFork = useCallback(async () => {
    if (!chatThread || !userId) {
      console.warn("Missing chat thread or user ID");
      return;
    }

    try {
      const newId = nanoid(10);
      const newThreadRef = doc(collection(db, "users", userId, "history"), newId);

      const threadData = {
        chats: chatThread.chats,
        messages: chatThread.messages,
        createdAt: serverTimestamp(),
      };

      await setDoc(newThreadRef, threadData);

      dispatch(addChatThread({ id: newId, chats: chatThread.chats, messages: chatThread.messages }));

      router.push(`/chat/${newId}`);
    } catch (error) {
      console.error("Error forking chat thread:", error);
    }
  }, [chatThread, userId, dispatch, router]);

  return { handleFork };
};

export default useChatFork;
