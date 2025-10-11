import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    
    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert AI image prompt generator. Generate detailed, professional image generation prompts in a single comprehensive paragraph format.

Your prompts must include these elements naturally woven together:
- Photography type and perspective (portrait, landscape, macro, aerial view, etc.)
- Main subjects and objects with precise descriptions
- Color palette and scheme details
- Atmosphere, mood, and lighting conditions
- Medium and artistic style (photorealistic, digital art, oil painting, 3D render, etc.)
- Environment and setting details
- Artistic influences or references when relevant

CRITICAL REQUIREMENTS:
1. Write in ONE flowing paragraph (not bullet points)
2. ALWAYS include "High resolution 8k" in every prompt
3. Be concise yet comprehensive
4. Use vivid, descriptive language
5. Make it ready for any AI image generator

Generate a complete, professional prompt based on the user's topic.`;

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
          { role: "user", content: `Generate a detailed image prompt for: ${topic}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const generatedPrompt = data.choices[0].message.content;

    console.log("Generated prompt successfully for topic:", topic);

    return new Response(
      JSON.stringify({ generatedPrompt }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-prompt function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
