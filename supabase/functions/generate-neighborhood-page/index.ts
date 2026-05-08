// Generate neighborhood-page editorial overrides using Lovable AI.
// Returns { draft: { title, intro, insider_tip, meta_title, meta_description, faqs[] } }.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert San Diego local-travel editor for sandiego.com.
You write punchy, locally-credible editorial intros and insider tips for category-by-neighborhood landing pages
(e.g. "Restaurants in La Jolla", "Hotels in Coronado", "Golf Courses in Carmel Valley").

Voice: warm, knowledgeable, lifestyle-magazine, second person where natural.
Be specific — name real streets, dishes, designers, vibes — never generic filler.
Avoid superlatives that can't be backed up.`;

interface GenerateBody {
  category_slug: string;
  category_label?: string;
  neighborhood_name: string;
  neighborhood_slug?: string;
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenerateBody;
    const { category_slug, neighborhood_name } = body;
    if (!category_slug || !neighborhood_name) {
      return new Response(
        JSON.stringify({ error: "Missing category_slug or neighborhood_name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const label = body.category_label || category_slug.replace(/-/g, " ");
    const userPrompt = `Generate editorial overrides for a landing page about ${label} in ${neighborhood_name}, San Diego.
${body.notes ? `Editor notes: ${body.notes}` : ""}

Be specific to ${neighborhood_name}: mention real streets, landmarks, vibes, and what makes this neighborhood distinct for ${label}.
Return a structured object via the provided tool.`;

    const parameters = {
      type: "object",
      properties: {
        title: { type: "string", description: "H1 / page title, e.g. 'Where to Eat in La Jolla'" },
        intro: { type: "string", description: "2–3 sentence editorial lede with specific local color (~280 chars)." },
        insider_tip: { type: "string", description: "1–2 sentence insider tip (parking, best time, hidden gem, member perk)." },
        meta_title: { type: "string", description: "SEO title <60 chars, includes category + neighborhood." },
        meta_description: { type: "string", description: "SEO meta description ~155 chars, includes a benefit hook." },
        faqs: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          description: "3–5 FAQs answering likely visitor questions.",
          items: {
            type: "object",
            properties: {
              q: { type: "string" },
              a: { type: "string" },
            },
            required: ["q", "a"],
          },
        },
      },
      required: ["title", "intro", "insider_tip", "meta_title", "meta_description", "faqs"],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          tools: [{
            functionDeclarations: [{
              name: "create_neighborhood_overrides",
              description: "Editorial overrides for a category × neighborhood landing page.",
              parameters,
            }],
          }],
          toolConfig: {
            functionCallingConfig: { mode: "ANY", allowedFunctionNames: ["create_neighborhood_overrides"] },
          },
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
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI provider error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const fnCall = parts.find((p: any) => p?.functionCall)?.functionCall;
    if (!fnCall?.args) {
      throw new Error("Model did not return a structured draft");
    }
    const draft = fnCall.args;

    return new Response(JSON.stringify({ draft }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-neighborhood-page error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
