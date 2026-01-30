import { generateText, Output } from "ai";
import { z } from "zod";
import { AI_PROMPTS } from "@/lib/ai-prompts";

const detectedFoodSchema = z.object({
  name: z.string().describe("Nome do alimento detectado em portugues"),
  present: z.boolean().describe("Se o alimento esta presente no prato"),
  observation: z.string().describe("Observacao sobre a aparencia ou qualidade do alimento"),
});

const plateAuditSchema = z.object({
  detectedFoods: z.array(detectedFoodSchema).describe("Lista de todos os alimentos identificados no prato"),
  wellPrepared: z.boolean().describe("Se o prato esta bem preparado (boa apresentacao, porcoes adequadas, cozimento correto)"),
  preparationNotes: z.string().describe("Observacoes detalhadas sobre a qualidade do preparo do prato"),
  notes: z.string().describe("Resumo geral da analise do prato em portugues"),
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
