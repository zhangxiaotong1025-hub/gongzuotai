// Agent chat streaming utility
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;

export type AgentDomain = "supply_chain" | "content" | "operation" | "design" | "general";

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export async function streamAgentChat({
  messages,
  agentDomain = "general",
  context,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  messages: AgentMessage[];
  agentDomain?: AgentDomain;
  context?: Record<string, unknown>;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        agent_domain: agentDomain,
        context,
      }),
      signal,
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({ error: "请求失败" }));
      onError(data.error || `HTTP ${resp.status}`);
      return;
    }

    if (!resp.body) {
      onError("No response body");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          /* ignore partial leftovers */
        }
      }
    }

    onDone();
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    onError((e as Error).message || "Unknown error");
  }
}

// Domain metadata
export const AGENT_DOMAINS: {
  key: AgentDomain;
  label: string;
  icon: string;
  description: string;
  color: string;
}[] = [
  {
    key: "supply_chain",
    label: "供应链",
    icon: "📦",
    description: "商品洞察、详情页生成、库存优化",
    color: "hsl(var(--benefit-blue))",
  },
  {
    key: "content",
    label: "内容生产",
    icon: "🎨",
    description: "素材文案、多渠道适配、内容策略",
    color: "hsl(var(--benefit-violet))",
  },
  {
    key: "operation",
    label: "经营运营",
    icon: "📊",
    description: "客户分群、营销策略、ROI归因",
    color: "hsl(var(--benefit-teal))",
  },
  {
    key: "design",
    label: "设计服务",
    icon: "🏠",
    description: "智能选品、方案生成、报价输出",
    color: "hsl(var(--benefit-amber))",
  },
  {
    key: "general",
    label: "智能助手",
    icon: "🤖",
    description: "通用问答与经营建议",
    color: "hsl(var(--primary))",
  },
];
