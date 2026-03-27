import { Check, Clock, XCircle, Pause, AlertTriangle, ArrowRight } from "lucide-react";
import type { EntitlementOrder } from "@/data/entitlement";

/** Lifecycle stage definition */
interface Stage {
  key: string;
  label: string;
  subtitle?: string;
  status: "completed" | "current" | "upcoming" | "skipped" | "error";
}

function resolveStages(order: EntitlementOrder): Stage[] {
  const { auditStatus, paymentStatus, orderStatus, orderType } = order;

  // --- Stage 1: Created ---
  const created: Stage = { key: "created", label: "订单创建", status: "completed" };

  // --- Stage 2: Audit ---
  const auditLabel =
    orderType === "internal_grant" ? "人工审核" :
    orderType === "enterprise_grant" ? "企业审核" : "自动审核";

  const audit: Stage = (() => {
    if (auditStatus === "auto_approved") return { key: "audit", label: auditLabel, subtitle: "自动通过", status: "completed" as const };
    if (auditStatus === "approved") return { key: "audit", label: auditLabel, subtitle: "已通过", status: "completed" as const };
    if (auditStatus === "rejected") return { key: "audit", label: auditLabel, subtitle: "已驳回", status: "error" as const };
    if (auditStatus === "follow_enterprise") return { key: "audit", label: auditLabel, subtitle: "跟随企业", status: "current" as const };
    return { key: "audit", label: auditLabel, subtitle: "审核中", status: "current" as const };
  })();

  // --- Stage 3: Payment ---
  const needsPayment = paymentStatus !== "no_payment";
  const payment: Stage = (() => {
    if (!needsPayment) return { key: "payment", label: "支付确认", subtitle: "无需支付", status: "skipped" as const };
    if (paymentStatus === "paid") return { key: "payment", label: "支付确认", subtitle: "已支付", status: "completed" as const };
    if (paymentStatus === "refunded") return { key: "payment", label: "支付确认", subtitle: "已退款", status: "error" as const };
    // pending
    if (audit.status === "completed" || audit.status === "skipped") return { key: "payment", label: "支付确认", subtitle: "待支付", status: "current" as const };
    return { key: "payment", label: "支付确认", status: "upcoming" as const };
  })();

  // --- Stage 4: Entitlement active ---
  const active: Stage = (() => {
    if (orderStatus === "active") return { key: "active", label: "权益生效", subtitle: "生效中", status: "current" as const };
    if (orderStatus === "suspended") return { key: "active", label: "权益生效", subtitle: "已暂停", status: "error" as const };
    if (orderStatus === "expired") return { key: "active", label: "权益生效", subtitle: "已到期", status: "completed" as const };
    if (["closed", "cancelled"].includes(orderStatus)) return { key: "active", label: "权益生效", status: "skipped" as const };
    return { key: "active", label: "权益生效", status: "upcoming" as const };
  })();

  // --- Stage 5: End state ---
  const end: Stage = (() => {
    if (orderStatus === "expired") return { key: "end", label: "订单完结", subtitle: "已到期", status: "current" as const };
    if (orderStatus === "closed") return { key: "end", label: "订单完结", subtitle: "已关闭", status: "error" as const };
    if (orderStatus === "cancelled") return { key: "end", label: "订单完结", subtitle: "已取消", status: "error" as const };
    return { key: "end", label: "订单完结", status: "upcoming" as const };
  })();

  return [created, audit, payment, active, end];
}

const statusConfig = {
  completed:  { icon: Check,          dotClass: "bg-primary border-primary text-primary-foreground",       lineClass: "bg-primary",               labelClass: "text-foreground" },
  current:    { icon: Clock,          dotClass: "bg-primary/10 border-primary text-primary animate-pulse", lineClass: "bg-primary/30",             labelClass: "text-primary font-semibold" },
  upcoming:   { icon: null,           dotClass: "bg-muted border-border text-muted-foreground",            lineClass: "bg-border",                labelClass: "text-muted-foreground" },
  skipped:    { icon: ArrowRight,     dotClass: "bg-muted border-border text-muted-foreground",            lineClass: "bg-border border-dashed",  labelClass: "text-muted-foreground" },
  error:      { icon: XCircle,        dotClass: "bg-destructive/10 border-destructive text-destructive",   lineClass: "bg-destructive/30",        labelClass: "text-destructive font-semibold" },
};

export function OrderLifecycleFlow({ order }: { order: EntitlementOrder }) {
  const stages = resolveStages(order);

  return (
    <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
      <h3 className="text-[14px] font-semibold text-foreground mb-5">订单生命周期</h3>

      {/* Flow visualization */}
      <div className="flex items-start">
        {stages.map((stage, idx) => {
          const cfg = statusConfig[stage.status];
          const Icon = cfg.icon;
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage.key} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
              {/* Node */}
              <div className="flex flex-col items-center" style={{ minWidth: 72 }}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${cfg.dotClass}`}>
                  {Icon && <Icon className="w-4 h-4" />}
                  {!Icon && <span className="w-2 h-2 rounded-full bg-current opacity-40" />}
                </div>
                <span className={`text-[12px] mt-2 text-center leading-tight ${cfg.labelClass}`}>
                  {stage.label}
                </span>
                {stage.subtitle && (
                  <span className={`text-[11px] mt-0.5 ${
                    stage.status === "error" ? "text-destructive" :
                    stage.status === "current" ? "text-primary" :
                    "text-muted-foreground"
                  }`}>
                    {stage.subtitle}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 flex items-center pt-[14px] px-1">
                  <div className={`h-[2px] w-full rounded-full ${
                    stage.status === "completed" ? cfg.lineClass :
                    stage.status === "skipped" ? "bg-border" :
                    "bg-border"
                  }`}
                  style={stage.status === "skipped" ? { backgroundImage: "repeating-linear-gradient(90deg, hsl(var(--border)) 0, hsl(var(--border)) 4px, transparent 4px, transparent 8px)", backgroundColor: "transparent" } : {}}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5 pt-4 border-t text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />已完成</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />进行中</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" />异常/终止</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" />待进行</span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[2px]" style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(var(--muted-foreground) / 0.3) 0, hsl(var(--muted-foreground) / 0.3) 2px, transparent 2px, transparent 4px)" }} />
          已跳过
        </span>
      </div>
    </div>
  );
}
