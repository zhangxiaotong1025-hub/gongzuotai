import { Building2, User } from "lucide-react";
import { QUOTA_SCOPES, getRuleScope, type QuotaScope, type EntitlementRule } from "@/data/entitlement";

/**
 * 权益规则 · 性质标签（企业池 / 个人池）
 * 跟随项目 Badge System 规范：rounded-full 胶囊 + 1.5h 实心点（这里用图标替代）。
 */
export function QuotaScopeBadge({
  scope,
  short = false,
  className = "",
}: {
  scope: QuotaScope;
  /** 紧凑模式：仅显示 2 字简短文案，适用于表格 / chip 内嵌 */
  short?: boolean;
  className?: string;
}) {
  const cfg = QUOTA_SCOPES.find((s) => s.value === scope)!;
  const Icon = scope === "enterprise" ? Building2 : User;
  return (
    <span
      title={cfg.desc}
      className={`inline-flex items-center gap-1 px-2 h-5 rounded-full border text-[11px] font-medium whitespace-nowrap ${cfg.className} ${className}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {short ? cfg.shortLabel : cfg.label}
    </span>
  );
}

/** 给某条规则直接出 Badge（自动从 rule.quotaScope 或能力 dataType 派生） */
export function RuleScopeBadge({ rule, short = false }: { rule: Pick<EntitlementRule, "quotaScope" | "capabilityId">; short?: boolean }) {
  return <QuotaScopeBadge scope={getRuleScope(rule)} short={short} />;
}
