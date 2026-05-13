import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { system, message } = await req.json();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
      }),
    }
  );

  const data = await response.json();
  console.log("Gemini response:", JSON.stringify(data));
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return NextResponse.json({ text });
}