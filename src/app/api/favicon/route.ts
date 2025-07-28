import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // safer with Buffer

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url || typeof url !== "string") {
    return new NextResponse(JSON.stringify({ error: "URL must be a string" }), { status: 400 });
  }

  try {
    const faviconUrl = new URL("/favicon.ico", url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const imageResponse = await fetch(faviconUrl.href, { signal: controller.signal });
    clearTimeout(timeout);

    const buffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/x-icon";

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Favicon fetch failed:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch favicon" }), { status: 500 });
  }
}
