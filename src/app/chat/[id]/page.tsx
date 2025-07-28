import Chat from "@/components/Chat/Chat";
import AuthWrapper from "../../AuthWrapper";
import { Metadata } from "next";
// import { Params } from "next/dist/shared/lib/router/utils"; // Optional helper
import { ResolvingMetadata } from "next";

// Next.js provides the correct typing for route params
export async function generateMetadata(
  { params }: { params: { id: string } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = params;

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

// No need for a custom PageProps type, just use the implicit params
const ChatPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  return (
    <AuthWrapper>
      <Chat id={id} />
    </AuthWrapper>
  );
};

export default ChatPage;