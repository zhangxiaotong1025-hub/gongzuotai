// Agent chat streaming utility + conversation persistence
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;

export type AgentDomain = "supply_chain" | "content" | "operation" | "design" | "general";

export interface AgentMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  agentDomain: AgentDomain;
  relatedModule?: string;
  relatedResourceId?: string;
  messages: AgentMessage[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedResult {
  id: string;
  conversationId?: string;
  taskType: string;
  agentDomain: AgentDomain;
  relatedModule: string;
  relatedResourceId: string;
  inputParams: Record<string, unknown>;
  outputResult: Record<string, unknown>;
  createdAt: string;
}

// ── Conversation persistence (localStorage, ready for DB migration) ──

const CONV_STORAGE_KEY = "agent_conversations";
const RESULT_STORAGE_KEY = "agent_generated_results";

function genId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(CONV_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function loadConversationsByDomain(domain: AgentDomain): Conversation[] {
  return loadConversations().filter((c) => c.agentDomain === domain);
}

export function loadConversation(id: string): Conversation | null {
  return loadConversations().find((c) => c.id === id) || null;
}

export function saveConversation(conv: Conversation): void {
  const all = loadConversations();
  const idx = all.findIndex((c) => c.id === conv.id);
  conv.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    all[idx] = conv;
  } else {
    all.unshift(conv);
  }
  // Keep max 50 conversations
  localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(all.slice(0, 50)));
}

export function deleteConversation(id: string): void {
  const all = loadConversations().filter((c) => c.id !== id);
  localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(all));
}

export function createConversation(domain: AgentDomain, relatedModule?: string, relatedResourceId?: string): Conversation {
  const conv: Conversation = {
    id: genId(),
    title: "新对话",
    agentDomain: domain,
    relatedModule,
    relatedResourceId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveConversation(conv);
  return conv;
}

// Auto-generate title from first user message
export function autoTitle(content: string): string {
  const cleaned = content.replace(/\n/g, " ").trim();
  return cleaned.length > 30 ? cleaned.slice(0, 30) + "..." : cleaned;
}

// ── Generated results persistence ──

export function loadResults(): GeneratedResult[] {
  try {
    return JSON.parse(localStorage.getItem(RESULT_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function loadResultsByResource(module: string, resourceId: string): GeneratedResult[] {
  return loadResults().filter(
    (r) => r.relatedModule === module && r.relatedResourceId === resourceId
  );
}

export function saveResult(result: GeneratedResult): void {
  const all = loadResults();
  all.unshift(result);
  localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(all.slice(0, 200)));
}

export function createAndSaveResult(
  conversationId: string | undefined,
  taskType: string,
  domain: AgentDomain,
  relatedModule: string,
  relatedResourceId: string,
  inputParams: Record<string, unknown>,
  outputResult: Record<string, unknown>
): GeneratedResult {
  const result: GeneratedResult = {
    id: genId(),
    conversationId,
    taskType,
    agentDomain: domain,
    relatedModule,
    relatedResourceId,
    inputParams,
    outputResult,
    createdAt: new Date().toISOString(),
  };
  saveResult(result);
  return result;
}

// ── Streaming ──

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
