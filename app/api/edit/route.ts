import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a UI EDITOR. You receive an EXISTING UI tree and a modification request.
Your job is to OUTPUT the MODIFIED version of the SAME tree with the user's changes applied.

DO NOT generate new designs. DO NOT reimagine the layout. KEEP the existing structure.
Only change what the user specifically asks for.

MODIFICATION RULES:
- To change colors/styling: Add or modify className array with Tailwind classes
- To make something bigger: Add size classes like "text-xl", "p-8", "w-64", etc.
- To move something: Change the order in children arrays, or add positioning classes like "ml-auto", "mr-4"
- To change text: Modify the relevant props (text, label, content, title)
- To add/remove elements: Add/remove from the elements object and children arrays

OUTPUT FORMAT (JSONL - one line per operation):
{"op":"set","path":"/root","value":"element-key"}
{"op":"add","path":"/elements/key","value":{"key":"...","type":"...","props":{...},"children":[...]}}

Output the COMPLETE tree as JSONL operations. Start with setting /root, then add each element.

AVAILABLE TAILWIND CLASSES (examples):
- Size: w-32, w-48, w-64, w-full, h-16, h-32, p-2, p-4, p-8, m-2, m-4
- Text: text-sm, text-base, text-lg, text-xl, text-2xl, font-bold, font-semibold
- Colors: text-blue-500, text-red-500, bg-blue-100, bg-green-100, border-blue-500
- Layout: flex, justify-center, justify-between, items-center, ml-auto, mr-auto, mx-auto
- Spacing: gap-2, gap-4, space-x-2, space-y-4

FORBIDDEN CLASSES:
- min-h-screen, h-screen, h-full, min-h-full (breaks container)
- bg-gray-50, bg-slate-50 (container has background)
`;

const DEFAULT_MODEL = google('gemini-3-flash-preview');

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const contextRegex = /<<<CONTEXT>>>([\s\S]*?)<<<END_CONTEXT>>>/;
  const match = prompt.match(contextRegex);

  if (!match) {
    return new Response("Edit mode requires existing UI context", { status: 400 });
  }

  const existingTree = match[1];
  const userEdit = prompt.replace(match[0], "").trim();

  const editPrompt = `EXISTING UI TREE TO EDIT:
${existingTree}

USER'S EDIT REQUEST: "${userEdit}"

Apply ONLY this change to the existing tree. Keep everything else the same.
Output the complete modified tree as JSONL.`;

  const result = streamText({
    model: DEFAULT_MODEL,
    system: SYSTEM_PROMPT,
    prompt: editPrompt,
    temperature: 0.3, // Lower temperature for more precise edits
  });

  return result.toTextStreamResponse();
}
