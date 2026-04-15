import { useState, useRef, useCallback, useEffect } from "react";
import {
  AgentMessage, AgentDomain, Conversation,
  streamAgentChat, createConversation, saveConversation,
  loadConversation, autoTitle, createAndSaveResult,
} from "@/lib/agent-chat";

interface UseAgentChatOptions {
  domain: AgentDomain;
  conversationId?: string | null;
  relatedModule?: string;
  relatedResourceId?: string;
  /** When true, auto-save the final assistant response as a GeneratedResult */
  saveAsResult?: boolean;
  resultTaskType?: string;
}

export function useAgentChat({
  domain = "general",
  conversationId: initialConvId,
  relatedModule,
  relatedResourceId,
  saveAsResult = false,
  resultTaskType = "content_generation",
}: UseAgentChatOptions) {
  const [conversation, setConversation] = useState<Conversation | null>(() => {
    if (initialConvId) return loadConversation(initialConvId);
    return null;
  });
  const [messages, setMessages] = useState<AgentMessage[]>(
    () => conversation?.messages || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const contextRef = useRef<Record<string, unknown> | undefined>();

  // Sync messages to conversation persistence
  const persistMessages = useCallback(
    (msgs: AgentMessage[], conv: Conversation) => {
      conv.messages = msgs;
      if (msgs.length >= 1 && conv.title === "新对话") {
        const firstUser = msgs.find((m) => m.role === "user");
        if (firstUser) conv.title = autoTitle(firstUser.content);
      }
      saveConversation(conv);
      setConversation({ ...conv });
    },
    []
  );

  const send = useCallback(
    async (input: string, context?: Record<string, unknown>) => {
      if (!input.trim() || isLoading) return;
      setError(null);
      contextRef.current = context;

      // Ensure conversation exists
      let conv = conversation;
      if (!conv) {
        conv = createConversation(domain, relatedModule, relatedResourceId);
        setConversation(conv);
      }

      const userMsg: AgentMessage = {
        role: "user",
        content: input.trim(),
        createdAt: new Date().toISOString(),
      };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      persistMessages(nextMessages, conv);
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
        onDone: () => {
          setIsLoading(false);
          // Persist final assistant message
          if (assistantSoFar) {
            const assistantMsg: AgentMessage = {
              role: "assistant",
              content: assistantSoFar,
              createdAt: new Date().toISOString(),
            };
            const finalMsgs = [...nextMessages, assistantMsg];
            setMessages(finalMsgs);
            persistMessages(finalMsgs, conv!);

            // Save as generated result if configured
            if (saveAsResult && relatedModule && relatedResourceId) {
              createAndSaveResult(
                conv!.id,
                resultTaskType,
                domain,
                relatedModule,
                relatedResourceId,
                contextRef.current || {},
                { content: assistantSoFar, generatedAt: new Date().toISOString() }
              );
            }
          }
        },
        onError: (err) => {
          setError(err);
          setIsLoading(false);
        },
        signal: controller.signal,
      });
    },
    [messages, isLoading, domain, conversation, persistMessages, relatedModule, relatedResourceId, saveAsResult, resultTaskType]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setConversation(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const loadExisting = useCallback((convId: string) => {
    const conv = loadConversation(convId);
    if (conv) {
      setConversation(conv);
      setMessages(conv.messages);
      setError(null);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversation,
    send,
    stop,
    clear,
    loadExisting,
  };
}
