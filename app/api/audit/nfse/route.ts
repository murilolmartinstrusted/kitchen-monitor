import { generateText, Output } from "ai";
import { z } from "zod";
import { AI_PROMPTS } from "@/lib/ai-prompts";

const nfseSchema = z.object({
  invoice_number: z.string().describe("The invoice/nota number"),
  issue_date: z
    .string()
    .describe("The issue date in YYYY-MM-DD format"),
  provider_name: z.string().describe("The service provider/issuer name"),
  client_name: z.string().describe("The client/recipient name"),
  service_description: z
    .string()
    .describe("Description of the services provided"),
  total_value: z.number().describe("Total value of the invoice"),
  tax_value: z.number().describe("Tax amount (ISS/impostos)"),
  city: z.string().describe("City/municipality of the service"),
  raw_summary: z
    .string()
    .describe("Brief summary of the invoice contents"),
});

export async function POST(req: Request) {
  try {
    const { xmlContent, filename } = await req.json();

    if (!xmlContent) {
      return Response.json({ error: "No XML content provided" }, { status: 400 });
    }

    const { output } = await generateText({
      model: "openai/gpt-4o",
      output: Output.object({
        schema: nfseSchema,
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${AI_PROMPTS.nfseParser}\n\nHere is the NFS-e XML content from file "${filename || "document.xml"}":\n\n${xmlContent}`,
            },
          ],
        },
      ],
    });

    return Response.json({ result: output });
  } catch (error) {
    console.error("NFS-e parsing error:", error);
    return Response.json(
      { error: "Failed to parse NFS-e XML" },
      { status: 500 }
    );
  }
}
