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
      elementType, // "background" | "character_body" | "character_face" | "prop"
      description,
      art_style,
      transparent = false,
      character_details = ""
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${elementType} element: ${description}`);

    let prompt = "";
    
    if (elementType === "background") {
      prompt = `Comic book background scene in ${art_style} style. ${description}. 
      
REQUIREMENTS:
- NO characters or people
- Just the environment and setting
- Professional comic book quality
- Clear, vibrant colors
- 1024x768 aspect ratio`;
    } else if (elementType === "character_body") {
      prompt = `Comic book character body (WITHOUT face details) in ${art_style} style. ${description}. ${character_details}.

REQUIREMENTS:
- Full body character pose
- Face should be simple/minimal (just basic head shape)
- Consistent with description
- Clean outlines
- ${transparent ? "TRANSPARENT background (PNG)" : "White background"}
- Professional comic book quality
- 512x768 portrait aspect ratio`;
    } else if (elementType === "character_face") {
      prompt = `Comic book character face close-up in ${art_style} style. ${description}. ${character_details}.

REQUIREMENTS:
- JUST the face and head
- Clear facial expression
- Detailed eyes, mouth, emotions
- Clean comic book style
- ${transparent ? "TRANSPARENT background (PNG)" : "White background"}
- Can be overlaid on character body
- 256x256 square aspect ratio`;
    } else if (elementType === "prop") {
      prompt = `Comic book prop/object in ${art_style} style. ${description}.

REQUIREMENTS:
- Single object only
- Clear, clean design
- ${transparent ? "TRANSPARENT background (PNG)" : "White background"}
- Professional comic book quality
- 384x384 square aspect ratio`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
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
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    console.log(`Successfully generated ${elementType} element`);

    return new Response(
      JSON.stringify({ imageUrl, elementType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-comic-element:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
