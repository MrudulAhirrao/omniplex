import Chat from "@/components/Chat/Chat";
import AuthWrapper from "../../AuthWrapper";
import { Metadata } from "next";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;

  if (!id) {
    return {
      title: "Chat",
      description: "Ask anything and get answers from AI.",
    };
  }

  const ogImageUrl = `https://omniplex.ai/api/og?id=${id}`;

  return {
    title: `Chat with Omniplex`,
    description: "Search online with the power of AI. Try now!",
    openGraph: {
      title: "Omniplex - Web Search AI",
      description: "Search online with the power of AI. Try now!",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Omniplex Chat Session",
        },
      ],
      url: `https://omniplex.ai/chat/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Omniplex - Web Search AI",
      description: "Search online with the power of AI. Try now!",
      images: [ogImageUrl],
    },
  };
}

const ChatPage = ({ params }: PageProps) => {
  const id = params.id;

  return (
    <AuthWrapper>
      <Chat id={id} />
    </AuthWrapper>
  );
};

export default ChatPage;
