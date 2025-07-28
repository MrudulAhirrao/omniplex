import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "katex/dist/katex.min.css";
import "./globals.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import AuthWrapper from "./AuthWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omniplex",
  description: "Search online with the power of AI. Try now!",
  icons: {
    icon: "/Logo.png",
    shortcut: "/Logo.png",
    apple: "/Apple-Icon.png",
  },
  openGraph: {
    title: "Omniplex - Web Search AI",
    description: "Search online with the power of AI. Try now!",
    url: "https://omniplex.ai/",
    siteName: "Omniplex",
    images: [
      {
        url: "https://omniplex.ai/OGImage.png",
        width: 1200,
        height: 630,
        alt: "Omniplex - Web Search AI",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omniplex - Web Search AI",
    description: "Search online with the power of AI. Try now!",
    images: [
      {
        url: "https://omniplex.ai/OGImage.png",
        width: 1200,
        height: 630,
        alt: "Omniplex - Web Search AI",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <Providers>
          <AuthWrapper>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
