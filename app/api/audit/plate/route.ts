import { generateText, Output } from "ai";
import { z } from "zod";
import { AI_PROMPTS } from "@/lib/ai-prompts";

const plateAuditSchema = z.object({
  bread: z.boolean().describe("Whether bread is present on the plate"),
  meat: z.boolean().describe("Whether meat/protein is present on the plate"),
  cheese: z.boolean().describe("Whether cheese is present on the plate"),
  compliant: z
    .boolean()
    .describe("Whether the plate meets all requirements (has all ingredients)"),
  notes: z
    .string()
    .describe("Brief explanation of the analysis findings"),
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
        schema: plateAuditSchema,
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: AI_PROMPTS.plateAudit,
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
    console.error("Plate audit error:", error);
    return Response.json(
      { error: "Failed to analyze plate image" },
      { status: 500 }
    );
  }
}
