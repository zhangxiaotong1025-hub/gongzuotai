import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AgentTriggerProps {
  onClick: () => void;
}

export default function AgentTrigger({ onClick }: AgentTriggerProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          size="icon"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
          }}
        >
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>智能助手</p>
      </TooltipContent>
    </Tooltip>
  );
}
