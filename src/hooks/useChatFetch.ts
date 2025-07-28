import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  selectChatThread,
  addChatThread,
  updateChatThread,
  removeChatThread,
} from "@/store/chatSlice";
import { RootState } from "@/store/store";

const useChatFetch = (id: string) => {
  const dispatch = useDispatch();
  const chatThread = useSelector((state: RootState) =>
    selectChatThread(state, id)
  );
  const [isFetching, setIsFetching] = useState(true);

  const fetchChatThread = useCallback(async () => {
    setIsFetching(true);
    try {
      const indexRef = doc(db, "index", id);
      const indexSnap = await getDoc(indexRef);

      if (!indexSnap.exists()) {
        dispatch(removeChatThread(id));
        setIsFetching(false);
        return;
      }

      const { userId: indexUserId } = indexSnap.data();
      const threadRef = doc(db, "users", indexUserId, "history", id);
      const threadSnap = await getDoc(threadRef);

      if (!threadSnap.exists()) {
        dispatch(removeChatThread(id));
        setIsFetching(false);
        return;
      }

      const threadData = threadSnap.data();
      const isShared = threadData.userId !== indexUserId;

      if (chatThread) {
        if (isShared) {
          dispatch(
            updateChatThread({
              id,
              chats: threadData.chats,
              messages: threadData.messages,
              shared: isShared,
            })
          );
        }
      } else {
        dispatch(
          addChatThread({
            id,
            chats: threadData.chats,
            messages: threadData.messages,
            shared: isShared,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching chat thread:", error);
    } finally {
      setIsFetching(false);
    }
  }, [dispatch, id, chatThread]);

  useEffect(() => {
    if (!chatThread || chatThread.shared) {
      fetchChatThread();
    } else {
      setIsFetching(false);
    }
  }, [fetchChatThread, chatThread]);

  return { chatThread, isFetching };
};

export default useChatFetch;
