import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
  fontFamily: "Inter, ui-sans-serif, system-ui",
  themeVariables: {
    background: "transparent",
    primaryColor: "#eef2ff",
    primaryTextColor: "#1e293b",
    primaryBorderColor: "#3b5bdb",
    lineColor: "#64748b",
    secondaryColor: "#f1f5f9",
    tertiaryColor: "#fafafa",
    clusterBkg: "#f8fafc",
    clusterBorder: "#cbd5e1",
    edgeLabelBackground: "#ffffff",
    fontSize: "13px",
  },
  flowchart: { curve: "basis", htmlLabels: true, padding: 12 },
  sequence: { useMaxWidth: true, mirrorActors: false, actorMargin: 60 },
});

let counter = 0;

export function Mermaid({ chart, caption }: { chart: string; caption?: string }) {
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const id = `mmd-${++counter}-${Date.now()}`;
    mermaid.render(id, chart)
      .then(({ svg }) => { setSvg(svg); setErr(""); })
      .catch((e) => setErr(String(e?.message ?? e)));
  }, [chart]);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <button
        type="button"
        onClick={() => { setZoom(1); setOpen(true); }}
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md border bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur transition hover:border-primary/60 hover:text-primary"
      >
        <Maximize2 className="h-3 w-3" /> 大图
      </button>
      <div
        className="overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {err && <pre className="font-mono text-[11px] text-destructive whitespace-pre-wrap">{err}</pre>}
      {caption && (
        <div className="mt-3 border-t pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          ◢ {caption}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[96vw] w-[96vw] h-[92vh] p-0 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">{caption || "架构图"}</DialogTitle>
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">◢ {caption || "DIAGRAM"}</div>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.max(0.4, +(z - 0.2).toFixed(2)))} className="inline-flex h-7 w-7 items-center justify-center rounded border text-muted-foreground hover:border-primary/60 hover:text-primary"><ZoomOut className="h-3.5 w-3.5"/></button>
              <span className="font-mono w-12 text-center text-[11px] tabular-nums">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(5, +(z + 0.2).toFixed(2)))} className="inline-flex h-7 w-7 items-center justify-center rounded border text-muted-foreground hover:border-primary/60 hover:text-primary"><ZoomIn className="h-3.5 w-3.5"/></button>
              <button onClick={() => setZoom(1)} className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border text-muted-foreground hover:border-primary/60 hover:text-primary"><RotateCcw className="h-3.5 w-3.5"/></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-background p-6">
            <div
              className="origin-top-left transition-transform [&_svg]:!w-full [&_svg]:!max-w-none [&_svg]:!h-auto"
              style={{ width: `${zoom * 100}%`, transformOrigin: "top left" }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** 叙事卡 · WHY / WHAT / HOW / GAIN */
export function DesignCard({
  code, title, children, tone = "primary",
}: {
  code?: string; title: string; children: React.ReactNode;
  tone?: "primary" | "secondary" | "accent" | "warning" | "success";
}) {
  const ringMap: Record<string, string> = {
    primary:   "border-primary/30",
    secondary: "border-border",
    accent:    "border-violet-400/30",
    warning:   "border-amber-400/30",
    success:   "border-emerald-400/30",
  };
  const textMap: Record<string, string> = {
    primary:   "text-primary",
    secondary: "text-muted-foreground",
    accent:    "text-violet-500",
    warning:   "text-amber-500",
    success:   "text-emerald-500",
  };
  return (
    <div className={`relative rounded-xl border bg-card p-5 ${ringMap[tone]}`} style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-center gap-3">
        {code && <span className={`font-mono text-[10px] tracking-widest ${textMap[tone]}`}>{code}</span>}
        <div className="text-[14px] font-semibold text-foreground">{title}</div>
      </div>
      <div className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

/** Page header · eyebrow + title + subtitle + meta */
export function PrdPageHeader({
  eyebrow, title, subtitle, meta,
}: { eyebrow: string; title: React.ReactNode; subtitle?: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <header className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-card to-card p-6">
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary/80">{eyebrow}</span>
          {meta && <span className="font-mono text-[10.5px] uppercase tracking-widest text-muted-foreground">{meta}</span>}
        </div>
        <h1 className="mt-2 text-[22px] md:text-[26px] font-bold leading-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-4xl text-[13px] text-muted-foreground leading-relaxed">{subtitle}</p>}
      </div>
    </header>
  );
}

/** 小框块 · 输入/输出/禁区式三联 */
export function TriBox({
  inputs, outputs, forbidden,
}: { inputs: string[]; outputs: string[]; forbidden: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="text-[11px] font-semibold text-primary">输入</div>
        <ul className="mt-1.5 text-[11.5px] text-foreground/90 list-disc pl-4 space-y-0.5">
          {inputs.map(x => <li key={x}>{x}</li>)}
        </ul>
      </div>
      <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3">
        <div className="text-[11px] font-semibold text-emerald-600">输出</div>
        <ul className="mt-1.5 text-[11.5px] text-foreground/90 list-disc pl-4 space-y-0.5">
          {outputs.map(x => <li key={x}>{x}</li>)}
        </ul>
      </div>
      <div className="rounded-lg border border-amber-400/40 bg-amber-400/5 p-3">
        <div className="text-[11px] font-semibold text-amber-600">禁区</div>
        <p className="mt-1.5 text-[11.5px] text-foreground/90">{forbidden}</p>
      </div>
    </div>
  );
}

/** Section H */
export function H({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[16px] font-semibold text-foreground flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      {children}
    </h2>
  );
}
