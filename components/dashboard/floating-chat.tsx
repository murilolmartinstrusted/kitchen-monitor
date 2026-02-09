"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Send,
  MessageCircle,
  Loader2,
  Sparkles,
  Minimize2,
} from "lucide-react";

interface FloatingChatProps {
  context: string;
  cardTitle: string;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function FloatingChat({
  context,
  cardTitle,
  isOpen,
  onClose,
}: FloatingChatProps) {
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/insights",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            messages,
            id,
            context,
          },
        }),
      }),
    [context]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on open
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const suggestedQuestions = [
    "Qual o resumo geral?",
    "O que precisa melhorar?",
    "Quais as tendencias?",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <Card className="flex flex-col overflow-hidden border-2 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-primary px-4 py-3">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
            <div>
              <p className="text-sm font-semibold leading-none">
                Assistente de Dados
              </p>
              <p className="text-[10px] opacity-80 mt-0.5">{cardTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar chat</span>
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[340px] px-4 py-3" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Pergunte sobre seus dados
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Analiso os dados de "{cardTitle}" para voce
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      sendMessage({ text: q });
                    }}
                    className="rounded-lg border bg-muted/50 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <span key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-muted px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t px-3 py-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo..."
            disabled={isLoading}
            className="h-9 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar mensagem</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
