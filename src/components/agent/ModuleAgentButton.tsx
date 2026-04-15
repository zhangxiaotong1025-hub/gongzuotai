import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentPanel from "./AgentPanel";
import { AgentDomain } from "@/lib/agent-chat";

interface ModuleAgentButtonProps {
  domain: AgentDomain;
  label?: string;
  context?: Record<string, unknown>;
  prompt?: string;
}

/**
 * Inline Agent button for module pages.
 * Opens the Agent panel with pre-configured domain and optional context/prompt.
 */
export default function ModuleAgentButton({
  domain,
  label = "AI 助手",
  context,
  prompt,
}: ModuleAgentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-[12px] h-8"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        {label}
      </Button>

      <AgentPanel
        open={open}
        onClose={() => setOpen(false)}
        defaultDomain={domain}
        context={context}
        initialPrompt={prompt}
      />
    </>
  );
}
