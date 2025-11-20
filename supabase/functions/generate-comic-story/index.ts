import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      age_range,
      target_audience,
      book_type,
      story_type,
      num_characters,
      character_details,
      tone,
      pages,
      panels_per_page,
      art_style,
      language,
      special_instructions
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const totalPanels = pages * panels_per_page;
    
    const systemPrompt = `You are a professional comic writer and visual storyteller. Generate a complete comic story as a JSON array of PANELS. Return ONLY valid JSON, no explanations, no markdown, no code fences.`;

    const userPrompt = `
Create a ${totalPanels}-panel comic story with these parameters:

Age Range: ${age_range}
Target Audience: ${target_audience}
Book Type: ${book_type}
Story Type: ${story_type}
Number of Characters: ${num_characters}
Character Details: ${character_details}
Tone: ${tone}
Pages: ${pages}
Panels Per Page: ${panels_per_page}
Art Style: ${art_style}
Language: ${language}
Special Instructions: ${special_instructions || "None"}

CRITICAL REQUIREMENTS:
1. Create exactly ${totalPanels} panels
2. Each panel must have:
   - panel: number
   - scene_description: 60-100 words (environment, characters, lighting, angle, mood, action)
   - textBlocks: array of dialogue, narration, or SFX
3. Character consistency: Use the same character names and descriptions throughout
4. Story structure: Setup (30%) → Conflict (45%) → Resolution (25%)
5. Return ONLY a JSON array, no markdown, no code fences

JSON format:
[
  {
    "panel": 1,
    "scene_description": "Detailed visual description...",
    "textBlocks": [
      {
        "role": "dialogue" | "thought" | "narration" | "sfx",
        "character": "CharacterName or null",
        "content": "Text content",
        "bubbleType": "speech" | "thought" | "caption" | "sfx"
      }
    ]
  }
]`;

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", response.status, error);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${error}`);
    }

    const data = await response.json();
    let storyContent = data.choices[0].message.content;

    // Clean up markdown formatting if present
    storyContent = storyContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON
    const panels = JSON.parse(storyContent);

    console.log(`Generated ${panels.length} panels for ${pages} pages`);

    return new Response(
      JSON.stringify({ panels }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-comic-story:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});