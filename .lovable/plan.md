
## Goal

Replace calls to the Lovable AI Gateway (`ai.gateway.lovable.dev`) with direct calls to Google AI Studio's Gemini API (`generativelanguage.googleapis.com`) so the AI features work on any host with a user-provided `GEMINI_API_KEY`.

## Scope

Only the two edge functions that use AI:
- `supabase/functions/generate-blog/index.ts` — drafts blog posts
- `supabase/functions/generate-neighborhood-page/index.ts` — generates neighborhood landing page editorial

Nothing else in the app changes. Admin UI, DB, auth, listings, etc. are untouched.

## Steps

1. **Add `GEMINI_API_KEY` secret**
   - Prompt the user to paste their Google AI Studio API key (from https://aistudio.google.com/apikey).
   - Stored as a backend secret, available to edge functions as `Deno.env.get("GEMINI_API_KEY")`.

2. **Rewrite `generate-blog/index.ts`**
   - Replace the `fetch` to `ai.gateway.lovable.dev` with a `POST` to:
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
   - Convert the OpenAI-style `messages` + `tools` payload to Gemini's native format:
     - `system_instruction` for the system prompt
     - `contents` array for the user message
     - `tools[].functionDeclarations` instead of OpenAI `tools`
     - `toolConfig.functionCallingConfig` with `mode: "ANY"` to force structured output
   - Parse the response from `candidates[0].content.parts[0].functionCall.args` instead of `choices[0].message.tool_calls[0].function.arguments`.
   - Preserve the existing 429 / 402 / generic error handling (Gemini returns 429 for rate limits; map quota errors similarly).

3. **Rewrite `generate-neighborhood-page/index.ts`**
   - Identical pattern to step 2 — same endpoint, same payload conversion, different schema/prompt.

4. **Leave `LOVABLE_API_KEY` in place but unused**
   - Don't delete it; harmless to keep. User can remove it later from secrets if desired.

5. **Test both functions**
   - Trigger each from the admin UI (or via the curl edge function tool) and verify a valid structured draft is returned.
   - Check logs for any schema-conversion issues.

## Technical notes

**Schema conversion:** OpenAI's `parameters` JSON Schema works almost as-is in Gemini's `functionDeclarations[].parameters`, with two caveats:
- Remove `additionalProperties: false` (Gemini rejects it).
- Gemini wants `type` values uppercase in some SDKs but accepts lowercase via the REST API — keeping lowercase is fine.

**Model choice:** Use `gemini-2.5-flash` (matches what the functions use today). If you want higher quality for blog drafts, `gemini-2.5-pro` is a drop-in swap.

**Free tier:** Google AI Studio's free tier has generous rate limits for Gemini Flash, plenty for admin-side draft generation.

## What's NOT in this plan

- No changes to frontend code or admin pages.
- No database migrations.
- No replacement of the AI Gateway for any future AI features — if you add more AI later, you'd extend the same Gemini pattern.
- No migration off Supabase. Edge functions still run on the Supabase project; only their outbound API target changes.
