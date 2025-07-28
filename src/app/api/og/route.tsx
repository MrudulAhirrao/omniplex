import { ImageResponse } from "next/og";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { cutString, getReadingTimeInMinutes } from "@/utils/utils";

export const runtime = "nodejs"; // Needed for Firebase SDK support

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "none";

    let chatThread: any = null;
    let question = "Untitled Conversation";
    let date = "";
    let readingTime = 0;

    // Load from Firestore only if id length matches expected format
    if (id.length === 10) {
      const indexRef = doc(db, "index", id);
      const indexSnap = await getDoc(indexRef);

      if (indexSnap.exists()) {
        const { userId } = indexSnap.data();
        const chatRef = doc(db, "users", userId, "history", id);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          chatThread = chatSnap.data();

          if (chatThread?.chats?.length > 0) {
            question = chatThread.chats[0]?.question || question;
            const timestamp = chatThread.createdAt?.toDate?.();
            if (timestamp) {
              const dateObj = new Date(timestamp);
              date = dateObj.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
              readingTime = getReadingTimeInMinutes(chatThread.chats);
            }
          }
        }
      }
    }

    // If no chat data found, return default OG image
    if (!chatThread) {
      return new ImageResponse(
        <img width="1200" height="630" src="https://omniplex.ai/OGImage.png" />,
        {
          width: 1200,
          height: 630,
          headers: { "Cache-Control": "public, max-age=3600" },
        }
      );
    }

    // Generate OG image dynamically
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            padding: "60px",
            backgroundColor: "#161616",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 72,
                lineHeight: "80px",
                color: "#ffffff",
                marginBottom: 24,
              }}
            >
              {cutString(question, 64)}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 32,
                lineHeight: "36px",
                color: "#8a8a8a",
              }}
            >
              {`${date} — ${readingTime} min read`}
            </div>
          </div>

          <img
            width={141}
            height={140}
            alt="Omniplex Logo"
            src="https://omniplex.ai/logo-og.svg" // Recommend hosting your logo as static
            style={{ marginBottom: 120 }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=3600", // Optional caching
        },
      }
    );
  } catch (e: any) {
    console.error("OG Image Generation Error:", e.message);
    return new Response("Failed to generate the image", { status: 500 });
  }
}
