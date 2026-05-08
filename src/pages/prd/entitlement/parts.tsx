import { ReactNode } from "react";

/* ──────────────────────────────────────────────
   PRD 共享 UI 组件
   ────────────────────────────────────────────── */

export function Floor({ id, children }: { id: string; children: ReactNode }) {
  return <section id={id} className="scroll-mt-[72px] space-y-4">{children}</section>;
}

export function H2({ icon: Icon, num, children }: { icon: React.ElementType; num: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-2 mt-8">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[11px] text-muted-foreground font-mono">{num}</div>
        <h2 className="text-[18px] font-semibold text-foreground leading-tight">{children}</h2>
      </div>
    </div>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[15px] font-semibold text-foreground mt-5 mb-2 flex items-center gap-2 before:content-[''] before:w-1 before:h-3.5 before:bg-primary before:rounded-sm">
      {children}
    </h3>
  );
}

export function H4({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-[13px] font-semibold text-foreground/90 mt-4 mb-1.5 uppercase tracking-wide">
      {children}
    </h4>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card border rounded-xl p-5 ${className}`} style={{ boxShadow: "var(--shadow-xs)" }}>
      {children}
    </div>
  );
}

export function Pre({ children }: { children: ReactNode }) {
  return (
    <pre className="bg-muted/40 border rounded-lg p-3.5 text-[11.5px] leading-[1.7] overflow-x-auto font-mono text-foreground/90 whitespace-pre">
      {children}
    </pre>
  );
}

export function Tag({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger" | "muted";
}) {
  const map: Record<string, string> = {
    info: "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 h-5 rounded-full border text-[11px] font-medium ${map[tone]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function Table({
  headers,
  rows,
  cols,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
  cols?: string[];
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="bg-muted/40">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 font-medium text-muted-foreground border-b"
                style={cols ? { width: cols[i] } : undefined}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/20 border-b last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top text-foreground/90">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Key-Value 信息块（紧凑两列） */
export function KV({ items }: { items: { k: string; v: ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-muted-foreground w-24 shrink-0">{it.k}</span>
          <span className="text-foreground/90 flex-1">{it.v}</span>
        </div>
      ))}
    </div>
  );
}

/** 数字统计块 */
export function Stat({ label, value, unit, tone = "info" }: { label: string; value: string | number; unit?: string; tone?: "info" | "success" | "warning" | "danger" }) {
  const colorMap: Record<string, string> = {
    info: "text-primary",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-destructive",
  };
  return (
    <div className="border rounded-lg p-3 bg-muted/20">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-[20px] font-bold mt-0.5 ${colorMap[tone]}`}>
        {value}
        {unit && <span className="text-[11px] text-muted-foreground ml-1 font-normal">{unit}</span>}
      </div>
    </div>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-[11.5px] text-primary px-1 py-0.5 bg-primary/5 rounded">{children}</code>;
}

/** 时序图气泡（左/右） */
export function SeqLine({ from, to, msg, kind = "req" }: { from: string; to: string; msg: string; kind?: "req" | "resp" | "evt" }) {
  const colorMap: Record<string, string> = {
    req: "text-primary border-primary/30 bg-primary/5",
    resp: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
    evt: "text-amber-500 border-amber-500/30 bg-amber-500/5",
  };
  const arrow = kind === "resp" ? "◀──" : kind === "evt" ? "═══▶" : "──▶";
  return (
    <div className="flex items-center gap-2 text-[12px] py-1">
      <span className="font-mono text-muted-foreground w-32 text-right">{from}</span>
      <span className="font-mono text-muted-foreground">{arrow}</span>
      <span className="font-mono text-muted-foreground w-32">{to}</span>
      <span className={`flex-1 px-2 py-0.5 rounded border text-[11.5px] ${colorMap[kind]}`}>{msg}</span>
    </div>
  );
}
