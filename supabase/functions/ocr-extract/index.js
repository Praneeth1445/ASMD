import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert OCR system for university exam answer sheet validation.
Analyze the exam sheet image and extract ALL data precisely.

STEP 1 - REGULATION DETECTION:
- If the sheet contains "PART A", "PART B", or "Total Marks (PART A & B)" → regulation = "R23"
- If the sheet contains columns like "Q No | a | b | c | Total" → regulation = "A3"
- Look carefully at the structure to determine the regulation.

STEP 2 - EXTRACTION:

If regulation = "A3", return this JSON:
{
  "regulation": "A3",
  "questions": [
    {"q": 1, "a": 4, "b": 3, "c": 2, "total": 9},
    {"q": 2, "a": 5, "b": 0, "c": 3, "total": 8}
  ],
  "writtenTotal": <number from TOTAL MARKS in figures>,
  "bubbleTotal": <number from OMR bubble digits>,
  "metadata": {
    "examName": "",
    "branch": "",
    "subjectCode": "",
    "subjectName": "",
    "examinerName": "",
    "scrutinizerName": ""
  }
}

If regulation = "R23", return this JSON:
{
  "regulation": "R23",
  "partA": [
    {"q": 1, "marks": 2},
    {"q": 2, "marks": 3}
  ],
  "partB": [
    {"q": 1, "i": 4, "ii": 3, "iii": 2},
    {"q": 2, "i": 5, "ii": 0, "iii": 3}
  ],
  "writtenTotal": <number from TOTAL MARKS in figures>,
  "bubbleTotal": <number from OMR bubble digits>,
  "metadata": {
    "examName": "",
    "branch": "",
    "subjectCode": "",
    "subjectName": "",
    "examinerName": "",
    "scrutinizerName": ""
  }
}

IMPORTANT:
- Detect regulation FIRST, then extract accordingly.
- Do NOT mix A3 and R23 structures.
- For A3: each question has sub-parts a, b, c and a total.
- For R23: Part A has simple marks per question. Part B has sub-parts i, ii, iii per question.
- "writtenTotal" = the number written in "TOTAL MARKS (in figures)" field.
- "bubbleTotal" = the number formed by the filled OMR bubbles (tens and units digits).
- If a field is unclear or missing, use null for totals, 0 for marks.
- Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
              {
                type: "text",
                text: "Detect the regulation (A3 or R23) from this exam sheet image, then extract all data accordingly. Return ONLY valid JSON.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse OCR response", raw: content }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ocr-extract error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
