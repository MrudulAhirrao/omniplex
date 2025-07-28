import OpenAI from "openai";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  // FIX: Check for the API key first to ensure it's configured.
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key is not configured." }),
      { status: 500 }
    );
  }

  try {
    const messages = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request body format." }),
        { status: 400 }
      );
    }

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "search",
          description: "Search for information based on a query",
          parameters: {
            type: "object",
            properties: {
              q: {
                type: "string",
                description: "The search query",
              },
            },
            required: ["q"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "stock",
          description: "Get the latest stock information for a given symbol",
          parameters: {
            type: "object",
            properties: {
              symbol: {
                type: "string",
                description: "Stock symbol to fetch data for.",
              },
            },
            required: ["symbol"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "dictionary",
          description: "Get dictionary information for a given word",
          parameters: {
            type: "object",
            properties: {
              word: {
                type: "string",
                description: "Word to look up in the dictionary.",
              },
            },
            required: ["word"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "weather",
          description: "Get the current weather in a given location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "City name to fetch the weather for.",
              },
              unit: {
                type: "string",
                enum: ["celsius", "fahrenheit"],
                description: "Temperature unit.",
              },
            },
            required: ["location"],
          },
        },
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages,
      tools,
      tool_choice: "auto",
    });

    const toolCalls = response.choices[0].message?.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      return new Response(JSON.stringify({ mode: "chat", arg: "" }), {
        status: 200,
      });
    }

    const { name, arguments: args } = toolCalls[0].function;
    return new Response(JSON.stringify({ mode: name, arg: args }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    
    let errorMessage = "Failed to process the input.";
    let statusCode = 500;

    if (error instanceof OpenAI.APIError) {
      errorMessage = error.message;
      // FIX: Provide a default value in case error.status is undefined
      statusCode = error.status ?? 500;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
    });
  }
}