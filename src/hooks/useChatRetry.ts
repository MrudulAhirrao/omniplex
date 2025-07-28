import { useCallback } from "react";
import toast from "react-hot-toast";

const delayPromise = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const useChatRetry = () => {
  const handleRetry = useCallback(
    async (
      func: (...args: any[]) => Promise<any>,
      maxRetries = 3,
      args: any[] = [],
      delay = 1000,
      exponentialBackoff = true
    ): Promise<any> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await func(...args);
        } catch (error: unknown) {
          console.error(`Error in ${func.name} (attempt ${attempt}):`, error);

          if (attempt < maxRetries) {
            const waitTime = exponentialBackoff ? delay * Math.pow(2, attempt - 1) : delay;
            await delayPromise(waitTime);
          } else {
            toast.error("Something went wrong. Please try again later.", {
              position: "top-center",
              style: {
                padding: "6px 18px",
                color: "#fff",
                background: "#FF4B4B",
              },
            });
            throw error;
          }
        }
      }
    },
    []
  );

  return { handleRetry };
};

export default useChatRetry;
