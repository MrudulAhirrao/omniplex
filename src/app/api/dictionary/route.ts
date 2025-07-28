import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "Word is required" }, { status: 400 });
  }

  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch definitions" }, { status: response.status });
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    const { word: w, phonetic, phonetics, origin, meanings } = data[0];

    const structuredData = {
      word: w,
      phonetic,
      phonetics,
      origin: origin ?? null,
      meanings: meanings.map((meaning: any) => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map((def: any) => ({
          definition: def.definition,
          example: def.example ?? null,
        })),
      })),
    };

    return NextResponse.json(structuredData, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "An error occurred while fetching definitions" }, { status: 500 });
  }
}
