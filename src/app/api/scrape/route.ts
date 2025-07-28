import type { NextRequest } from "next/server";

export const runtime = "edge";

// --- In-memory cache to reduce redundant scraping ---
const cache = new Map<string, string>();

// --- Extract visible body text from HTML ---
function extractBodyText(html: string): string {
  const bodyStart = html.indexOf("<body");
  const bodyEnd = html.indexOf("</body>", bodyStart);

  if (bodyStart === -1 || bodyEnd === -1) return "";

  const bodyContent = html.slice(bodyStart, bodyEnd + 7);

  return bodyContent
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim()
    .slice(0, 5000); // Limit to 5000 chars
}

// --- Fetch and parse body text from a URL ---
async function scrapeText(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[${url}] HTTP error: ${response.status}`);
      return "";
    }

    const html = await response.text();
    return extractBodyText(html);
  } catch (err) {
    console.error(`[${url}] Fetch failed:`, err);
    return "";
  }
}

// --- POST handler to scrape multiple URLs ---
export async function POST(req: NextRequest): Promise<Response> {
  const query = new URL(req.url).searchParams;
  const urls = query.get("urls")?.split(",").map(url => url.trim()).filter(Boolean) ?? [];

  if (urls.length === 0) {
    return new Response(
      JSON.stringify({ error: "Please provide valid URLs as a comma-separated list." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const results = await Promise.all(
      urls.map(async (url) => {
        if (cache.has(url)) return cache.get(url) || "";
        const data = await scrapeText(url);
        cache.set(url, data);
        return data;
      })
    );

    const output = urls
      .map((url, i) => `${url}\nWebsite Data:\n${results[i]}`)
      .join("\n\n");

    return new Response(output, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong while scraping." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
