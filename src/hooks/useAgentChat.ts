import { useState, useRef, useCallback } from "react";
import { AgentMessage, AgentDomain, streamAgentChat } from "@/lib/agent-chat";

export function useAgentChat(domain: AgentDomain = "general") {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (input: string, context?: Record<string, unknown>) => {
      if (!input.trim() || isLoading) return;
      setError(null);

      const userMsg: AgentMessage = { role: "user", content: input.trim() };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setIsLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      let assistantSoFar = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      await streamAgentChat({
        messages: nextMessages,
        agentDomain: domain,
        context,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          setError(err);
          setIsLoading(false);
        },
        signal: controller.signal,
      });
    },
    [messages, isLoading, domain]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
    setError(null);
  }, []);

  return { messages, isLoading, error, send, stop, clear };
}
