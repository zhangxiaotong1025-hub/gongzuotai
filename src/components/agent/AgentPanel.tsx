import { useState, useRef, useEffect } from "react";
import { X, Send, Square, Trash2, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAgentChat } from "@/hooks/useAgentChat";
import { AGENT_DOMAINS, AgentDomain } from "@/lib/agent-chat";
import ReactMarkdown from "react-markdown";

interface AgentPanelProps {
  open: boolean;
  onClose: () => void;
  /** Pre-select domain */
  defaultDomain?: AgentDomain;
  /** Context data to send with messages */
  context?: Record<string, unknown>;
  /** Quick prompt to auto-send on open */
  initialPrompt?: string;
}

export default function AgentPanel({
  open,
  onClose,
  defaultDomain = "general",
  context,
  initialPrompt,
}: AgentPanelProps) {
  const [domain, setDomain] = useState<AgentDomain>(defaultDomain);
  const [input, setInput] = useState("");
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const { messages, isLoading, error, send, stop, clear } = useAgentChat(domain);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentInitial = useRef(false);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Auto-send initial prompt
  useEffect(() => {
    if (open && initialPrompt && !sentInitial.current && messages.length === 0) {
      sentInitial.current = true;
      send(initialPrompt, context);
    }
  }, [open, initialPrompt, messages.length, send, context]);

  // Reset on domain change
  useEffect(() => {
    clear();
    sentInitial.current = false;
  }, [domain, clear]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    send(input, context);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentDomain = AGENT_DOMAINS.find((d) => d.key === domain)!;

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] max-w-full z-50 flex flex-col border-l border-border/60 shadow-lg"
      style={{ background: "hsl(var(--card))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border/60 shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowDomainPicker(!showDomainPicker)}
            className="flex items-center gap-2 hover:bg-muted rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <span className="text-base">{currentDomain.icon}</span>
            <span className="text-[13px] font-medium text-foreground">{currentDomain.label}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {showDomainPicker && (
            <div className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-border/60 p-2 z-10 shadow-lg"
              style={{ background: "hsl(var(--card))" }}
            >
              {AGENT_DOMAINS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => { setDomain(d.key); setShowDomainPicker(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    domain === d.key ? "bg-primary/8 text-primary" : "hover:bg-muted"
                  )}
                >
                  <span className="text-lg">{d.icon}</span>
                  <div>
                    <div className="text-[13px] font-medium">{d.label}</div>
                    <div className="text-[11px] text-muted-foreground">{d.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clear} title="清空对话">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${currentDomain.color}15` }}
            >
              <Sparkles className="w-6 h-6" style={{ color: currentDomain.color }} />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">{currentDomain.label} Agent</h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {currentDomain.description}
            </p>
            <div className="mt-6 space-y-2 w-full">
              {getQuickPrompts(domain).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => send(prompt, context)}
                  className="w-full text-left text-[12px] text-muted-foreground hover:text-foreground px-3 py-2.5 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-foreground"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-headings:mb-2 prose-headings:mt-3">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted/60 rounded-xl px-3.5 py-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-[12px] text-destructive bg-destructive/8 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border/60 shrink-0">
        <div className="flex items-end gap-2 bg-muted/40 rounded-xl px-3 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none max-h-32"
            style={{ minHeight: 24 }}
          />
          {isLoading ? (
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={stop}>
              <Square className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0 text-primary"
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function getQuickPrompts(domain: AgentDomain): string[] {
  switch (domain) {
    case "supply_chain":
      return [
        "帮我分析沙发品类的市场趋势和选品建议",
        "根据以下商品信息生成一个专业的详情页",
        "分析我的商品库存健康度，给出优化建议",
      ];
    case "content":
      return [
        "为这款商品生成多渠道的营销文案",
        "分析现有商品素材质量并给出补拍建议",
        "为即将到来的促销活动生成内容排期方案",
      ];
    case "operation":
      return [
        "帮我分析客户分群，找出高价值客户",
        "设计一个针对沉睡客户的唤醒策略",
        "评估上个月营销活动的ROI表现",
      ];
    case "design":
      return [
        "根据这个户型自动选品组合方案",
        "生成一套现代简约风的客厅方案",
        "帮我优化方案报价，控制在预算内",
      ];
    default:
      return [
        "分析我的经营数据，给出优化建议",
        "帮我制定本月的运营计划",
        "有哪些可以提升转化率的策略？",
      ];
  }
}
