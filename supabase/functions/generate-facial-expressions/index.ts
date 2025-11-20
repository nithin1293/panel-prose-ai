import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXPRESSIONS = [
  "happy and smiling brightly",
  "sad and crying with tears",
  "angry with furrowed brows",
  "surprised with wide eyes and open mouth",
  "scared and worried",
  "confused and puzzled",
  "excited and enthusiastic",
  "tired and sleepy"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      character_details,
      art_style,
      base_description = ""
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${EXPRESSIONS.length} facial expressions`);

    const expressionPromises = EXPRESSIONS.map(async (expression, index) => {
      const prompt = `Comic book character face in ${art_style} style. ${character_details}. ${base_description}.
      
EXPRESSION: ${expression}

REQUIREMENTS:
- JUST the face and head
- Clear ${expression} facial expression
- Detailed eyes and mouth showing emotion
- Clean comic book style
- TRANSPARENT background (PNG)
- 256x256 square
- Consistent character features`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"]
          }),
        });

        if (!response.ok) {
          console.error(`Failed to generate expression ${index + 1}:`, response.status);
          return null;
        }

        const data = await response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageUrl) return null;

        return {
          expression: expression.split(" ")[0], // "happy", "sad", etc.
          imageUrl,
          fullDescription: expression
        };
      } catch (err) {
        console.error(`Error generating expression ${index + 1}:`, err);
        return null;
      }
    });

    const results = await Promise.all(expressionPromises);
    const expressions = results.filter(r => r !== null);

    console.log(`Successfully generated ${expressions.length} expressions`);

    return new Response(
      JSON.stringify({ expressions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-facial-expressions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
