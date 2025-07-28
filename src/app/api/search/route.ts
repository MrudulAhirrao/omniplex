import { NextRequest, NextResponse } from "next/server";

const BING_API_KEY = process.env.BING_API_KEY;

export const runtime = "edge";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  // Validation: Missing or invalid query
  if (!query || typeof query !== "string") {
    return new NextResponse(
      JSON.stringify({
        error: 'Missing or invalid "q" parameter in the URL.',
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!BING_API_KEY) {
    console.error("[Search API] BING_API_KEY is not set in .env.local");
    return new NextResponse(
      JSON.stringify({
        error: "Search API key is not configured on the server.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const serpApiUrl = `https://serpapi.com/search.json?engine=bing&q=${encodeURIComponent(
      query
    )}&cc=US&api_key=${BING_API_KEY}`;

    const response = await fetch(serpApiUrl);

    // If SerpAPI fails
    if (!response.ok) {
      console.error(`[Search API] Failed with status ${response.status}`);
      return new NextResponse(
        JSON.stringify({
          error: `Search API error. Status code: ${response.status}`,
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();

    // Success response
    return new NextResponse(
      JSON.stringify({
        message: "Search results fetched successfully.",
        data: result,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[Search API] Unexpected error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error. Failed to fetch search results.",
        detail: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
