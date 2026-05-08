// Generate a blog post draft using Lovable AI
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert lifestyle and travel blog writer for sandiego.com.
Write engaging, vivid, locally-aware blog posts for visitors and residents of San Diego.

Voice: warm, knowledgeable, lifestyle-magazine, second person where natural.
Format: Markdown. Use ## for section headings, **bold** for emphasis, and short paragraphs.
Length: 600-900 words unless asked otherwise.
Always include a strong opening hook and a clear closing thought.`;

interface GenerateBody {
  prompt: string;
  tone?: string;
  length?: "short" | "medium" | "long";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, tone, length }: GenerateBody = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'prompt' string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const lengthHint =
      length === "short" ? "~400 words"
      : length === "long" ? "~1100 words"
      : "~700 words";

    const userPrompt = `Topic / brief: ${prompt}
${tone ? `Tone overrides: ${tone}` : ""}
Target length: ${lengthHint}

Return a JSON object via the provided tool. Generate compelling, specific San Diego content — name real neighborhoods, restaurants, beaches, etc. when relevant.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_blog_draft",
                description: "Create a structured blog post draft.",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Catchy, SEO-friendly title (50-65 chars)" },
                    subtitle: { type: "string", description: "One-line dek under the title" },
                    excerpt: { type: "string", description: "1-2 sentence summary (~160 chars) for previews" },
                    body_markdown: { type: "string", description: "Full post body in Markdown" },
                    suggested_slug: { type: "string", description: "url-friendly-slug" },
                    tags: { type: "array", items: { type: "string" }, description: "3-6 lowercase tags" },
                    category: { type: "string", description: "One of: Food, Beaches, Neighborhoods, Events, Outdoors, Family, Nightlife, Culture" },
                    meta_title: { type: "string" },
                    meta_description: { type: "string", description: "~155 chars" },
                    read_time_minutes: { type: "number" },
                  },
                  required: [
                    "title", "subtitle", "excerpt", "body_markdown", "suggested_slug",
                    "tags", "category", "meta_title", "meta_description", "read_time_minutes",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_blog_draft" } },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("Model did not return a structured draft");
    }
    const draft = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ draft }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
