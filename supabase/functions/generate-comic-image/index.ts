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
      scene_description,
      character_details,
      art_style,
      textBlocks,
      panelNumber
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating image for panel ${panelNumber}`);

    // Build the comprehensive prompt with integrated text
    let textInstructions = "";
    if (textBlocks && textBlocks.length > 0) {
      textInstructions = "\n\nINCLUDE THESE TEXT ELEMENTS IN THE IMAGE:\n";
      textBlocks.forEach((block: any) => {
        if (block.bubbleType === "speech") {
          textInstructions += `- Speech bubble${block.character ? ` from ${block.character}` : ""}: "${block.content}"\n`;
        } else if (block.bubbleType === "thought") {
          textInstructions += `- Thought bubble${block.character ? ` from ${block.character}` : ""}: "${block.content}"\n`;
        } else if (block.bubbleType === "caption") {
          textInstructions += `- Narration caption box: "${block.content}"\n`;
        } else if (block.bubbleType === "sfx") {
          textInstructions += `- Sound effect text: "${block.content}"\n`;
        }
      });
    }

    const imagePrompt = `Professional comic book panel in ${art_style} style.

SCENE: ${scene_description}

CHARACTER REFERENCE (maintain consistency): ${character_details}

STYLE REQUIREMENTS:
- ${art_style} art style
- Children's comic book quality
- Vibrant colors and clear compositions
- Professional comic panel framing
- Leave space for text overlays at the top or sides

${textInstructions}

CRITICAL: Draw the speech bubbles, thought bubbles, caption boxes, and all text DIRECTLY INTO the image. The text should be part of the illustration, not added later. Use clear, readable fonts and proper comic book bubble styling with tails pointing to speakers.`;

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
            content: imagePrompt
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

    console.log(`Successfully generated image for panel ${panelNumber}`);

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-comic-image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});