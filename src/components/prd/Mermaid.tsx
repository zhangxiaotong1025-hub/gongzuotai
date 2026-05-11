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
    <div className="relative rounded-lg border bg-card p-6">
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
        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
          Fig · {caption}
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

/** 叙事卡 · 简洁版：去重影、去色块，仅保留左侧色条 */
export function DesignCard({
  code, title, children, tone = "primary",
}: {
  code?: string; title: string; children: React.ReactNode;
  tone?: "primary" | "secondary" | "accent" | "warning" | "success";
}) {
  const barMap: Record<string, string> = {
    primary:   "bg-primary",
    secondary: "bg-muted-foreground/40",
    accent:    "bg-violet-500",
    warning:   "bg-amber-500",
    success:   "bg-emerald-500",
  };
  const textMap: Record<string, string> = {
    primary:   "text-primary",
    secondary: "text-muted-foreground",
    accent:    "text-violet-500",
    warning:   "text-amber-500",
    success:   "text-emerald-500",
  };
  return (
    <div className="relative rounded-lg border bg-card pl-5 pr-5 py-5">
      <span className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r ${barMap[tone]}`} />
      <div className="flex items-baseline gap-2.5">
        {code && <span className={`font-mono text-[9.5px] tracking-[0.16em] uppercase ${textMap[tone]}`}>{code}</span>}
        <div className="text-[13.5px] font-semibold text-foreground">{title}</div>
      </div>
      <div className="mt-2.5 text-[12.5px] leading-[1.75] text-foreground/75">{children}</div>
    </div>
  );
}

/** Page header · 减弱渐变与色块，回归正统 PRD 卷首 */
export function PrdPageHeader({
  eyebrow, title, subtitle, meta,
}: { eyebrow: string; title: React.ReactNode; subtitle?: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <header className="border-b pb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">{eyebrow}</span>
        {meta && <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{meta}</span>}
      </div>
      <h1 className="mt-3 text-[24px] md:text-[28px] font-semibold leading-[1.25] text-foreground tracking-tight">
        {title}
      </h1>
      {subtitle && <p className="mt-3 max-w-[68ch] text-[13px] text-muted-foreground leading-[1.8]">{subtitle}</p>}
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

/** Section H · 更克制的章节标题 */
export function H({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="mb-5 pb-2 border-b text-[15.5px] font-semibold text-foreground tracking-tight flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
      {children}
    </h2>
  );
}
