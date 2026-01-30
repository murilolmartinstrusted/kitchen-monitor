import { generateText, Output } from "ai";
import { z } from "zod";
import { AI_PROMPTS } from "@/lib/ai-prompts";

const epiStatusSchema = z.union([
  z.boolean(),
  z.literal("uncertain"),
]);

const epiCheckSchema = z.object({
  hairnet: epiStatusSchema.describe(
    "Whether the worker is wearing a hairnet or hair covering"
  ),
  gloves: epiStatusSchema.describe(
    "Whether the worker is wearing food service gloves"
  ),
  apron: epiStatusSchema.describe(
    "Whether the worker is wearing a protective apron or uniform"
  ),
  compliant: z
    .boolean()
    .describe("Whether the worker meets all EPI requirements"),
  notes: z
    .string()
    .describe("Brief explanation of the compliance assessment"),
});

export async function POST(req: Request) {
  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return Response.json({ error: "No image data provided" }, { status: 400 });
    }

    const { output } = await generateText({
      model: "openai/gpt-4o",
      output: Output.object({
        schema: epiCheckSchema,
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: AI_PROMPTS.epiCompliance,
            },
            {
              type: "image",
              image: imageData,
            },
          ],
        },
      ],
    });

    return Response.json({ result: output });
  } catch (error) {
    console.error("EPI check error:", error);
    return Response.json(
      { error: "Failed to analyze EPI compliance" },
      { status: 500 }
    );
  }
}
