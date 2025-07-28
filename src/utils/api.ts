export const handleMode = async (text: string) => {
  try {
    const response = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          role: "system",
          content:
            "You are an AI Assistant who is supposed to use functions or chat based on the user query. " +
            "If the user wants to search for information, use the search function. " +
            "If the user wants stock information, use the stock function. " +
            "If the user wants weather information, use the weather function. " +
            "If the user wants dictionary information, use the dictionary function.",
        },
        { role: "user", content: text },
      ]),
    });

    // FIX: Better error handling to show the actual server message instead of a generic one.
    if (!response.ok) {
      const errorData = await response.json();
      // This will now throw the specific message from the server, e.g., "OpenAI quota exceeded".
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Mode and arguments:", data);
    return { mode: data.mode, arg: data.arg };
  } catch (error) {
    console.error("Error fetching mode and arguments:", error);
    throw error; // Re-throw the error so the UI component can catch and display it.
  }
};