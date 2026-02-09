import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context: string } =
    await req.json();

  const result = streamText({
    model: "openai/gpt-4o",
    system: `Voce e um assistente especialista em controle de qualidade de cozinhas industriais e servicos alimentares. 
Voce analisa dados operacionais e fornece insights, recomendacoes e respostas claras em portugues brasileiro.

Aqui estao os dados operacionais atuais do dashboard para contexto:
${context}

Use esses dados para responder as perguntas do usuario de forma precisa e objetiva. 
Foque em insights praticos, tendencias, e sugestoes de melhoria.
Seja conciso e direto nas respostas.
Formate respostas com marcadores quando listar multiplos itens.`,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  });
}
