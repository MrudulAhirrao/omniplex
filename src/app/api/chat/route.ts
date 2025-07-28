import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    messages,
    model,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
  } = body;

  if (!messages || !model) {
    return new Response("Missing required fields: 'messages' or 'model'", { status: 400 });
  }

  const response = await openai.chat.completions.create({
    stream: true,
    model,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
    messages,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
