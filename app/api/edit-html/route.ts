import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 120;

const SYSTEM_PROMPT = `You are an HTML editor. Output ONLY modified HTML. No markdown fences, no explanations.

RULES:
- Modify Tailwind CSS classes to achieve the requested change
- Keep structure intact, only change styling classes
- For "black background": add bg-black and text-white classes
- For colors: use bg-{color}-{shade}, text-{color}-{shade}
- Output raw HTML only, nothing else`;

// Models in order of preference
const MODELS = [
  { id: 'gemini-2.5-flash', timeout: 15000 },
  { id: 'gemini-2.0-flash', timeout: 15000 },
  { id: 'gemini-2.5-pro', timeout: 20000 },
  { id: 'gemini-3.0-pro', timeout: 20000 },
];


export async function POST(req: Request) {
  const { html, instruction } = await req.json();

  if (!html || !instruction) {
    return new Response("Missing html or instruction", { status: 400 });
  }

  console.log("=== EDIT-HTML API ===");
  console.log("Instruction:", instruction);
  console.log("Input HTML length:", html.length);

  const editPrompt = `Current HTML to modify:
\`\`\`html
${html}
\`\`\`

User's edit request: "${instruction}"

Output the COMPLETE modified HTML below (no code fences, no explanation):`;

  let lastError: Error | null = null;

  // Try each model in sequence until one succeeds
  for (const modelId of MODELS) {
    try {
      console.log(`Trying model: ${modelId}`);
      
      const result = streamText({
        model: google(modelId.id),
        system: SYSTEM_PROMPT,
        prompt: editPrompt,
        temperature: 0.3,
      });

      // Get the full text first to verify we got content
      // This also ensures the model actually ran successfully
      const fullText = await result.text;
      
      console.log(`Model ${modelId} returned ${fullText.length} chars`);
      // console.log(`First 200 chars:`, fullText.substring(0, 200));
      
      if (!fullText || fullText.trim().length === 0) {
        console.log(`Model ${modelId} returned empty response, trying next`);
        lastError = new Error("Empty response from model");
        continue;
      }

      // Clean up any markdown fences if present
      let cleanHtml = fullText;
      if (cleanHtml.includes('```')) {
        cleanHtml = cleanHtml.replace(/```html?\n?/g, '').replace(/```\n?/g, '');
      }
      cleanHtml = cleanHtml.trim();
      
      console.log(`Final cleaned HTML length: ${cleanHtml.length}`);

      // Return as a simple text response (not streaming, since we already have full text)
      // This is simpler for the client to handle than dealing with streams that might fail mid-way
      return new Response(cleanHtml, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
      
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Model ${modelId} failed: ${lastError.message}`);
      // Continue to next model
    }
  }

  // All models failed
  console.error("All models failed:", lastError?.message);
  return new Response(`All AI models failed: ${lastError?.message}`, { status: 503 });
}
