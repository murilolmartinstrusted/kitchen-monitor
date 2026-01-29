import { generateText, Output } from "ai";
import { z } from "zod";
import { AI_PROMPTS } from "@/lib/ai-prompts";

const cleaningStatusSchema = z.union([
  z.boolean(),
  z.literal("uncertain"),
]);

const cleaningAuditSchema = z.object({
  counter_clean: cleaningStatusSchema.describe(
    "Whether the counter/work surface is clean"
  ),
  trash_full: cleaningStatusSchema.describe(
    "Whether the trash container is full or overflowing"
  ),
  floor_dirty: cleaningStatusSchema.describe(
    "Whether the floor has visible dirt or debris"
  ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall cleanliness score from 0-100"),
  notes: z
    .string()
    .describe("Brief explanation of the cleaning assessment"),
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
        schema: cleaningAuditSchema,
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: AI_PROMPTS.cleaningAudit,
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
    console.error("Cleaning audit error:", error);
    return Response.json(
      { error: "Failed to analyze cleaning image" },
      { status: 500 }
    );
  }
}
