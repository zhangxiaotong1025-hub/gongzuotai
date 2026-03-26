import { useParams, useNavigate, Link } from "react-router-dom";
import { ruleData, skuData, bundleData, STATUS_MAP, PERIOD_TYPES, GRANT_TYPES, EXPIRE_POLICIES, BILLING_CYCLES, DATA_TYPES, getCapability, getApp } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { toast } from "sonner";

export default function RuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ruleIndex = ruleData.findIndex((r) => r.id === id);
  const rule = ruleIndex >= 0 ? ruleData[ruleIndex] : null;
  if (!rule) return <div className="p-10 text-center text-muted-foreground">权益规则不存在</div>;

  const cap = getCapability(rule.capabilityId);
  const app = cap ? getApp(cap.appId) : null;
  const skus = skuData.filter((s) => (s.ruleIds || []).includes(rule.id));
  const bundles = bundleData.filter((b) => b.items.some((i) => skus.some((s) => s.id === i.skuId)));
  const prevRule = ruleIndex > 0 ? ruleData[ruleIndex - 1] : null;
  const nextRule = ruleIndex < ruleData.length - 1 ? ruleData[ruleIndex + 1] : null;

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="权益规则管理"
        backPath="/entitlement/rule"
        currentName={rule.name}
        prevPath={prevRule ? `/entitlement/rule/detail/${prevRule.id}` : null}
        nextPath={nextRule ? `/entitlement/rule/detail/${nextRule.id}` : null}
        onEdit={() => toast.info("编辑功能开发中")}
        onCopy={() => toast.success("规则已复制（功能开发中）")}
        statusToggle={{
          currentActive: rule.status === "active",
          onToggle: () => toast.info(rule.status === "active" ? "已停用" : "已启用"),
        }}
      />

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-foreground">{rule.name}</h2>
          <span className={STATUS_MAP[rule.status].className}>{STATUS_MAP[rule.status].label}</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">规则编码</span><div className="font-mono text-foreground mt-0.5">{rule.code}</div></div>
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5">{app ? <Link to={`/entitlement/app/detail/${app.id}`} className="text-primary hover:underline">{app.name}</Link> : "—"}</div></div>
          <div><span className="text-muted-foreground">关联能力</span><div className="mt-0.5">{cap ? <Link to={`/entitlement/capability/detail/${cap.id}`} className="text-primary hover:underline">{cap.name}</Link> : "—"}</div></div>
          <div><span className="text-muted-foreground">数据类型</span><div className="text-foreground mt-0.5">{cap ? `${DATA_TYPES.find((t) => t.value === cap.dataType)?.label.split("（")[0]} · ${cap.unit}` : "—"}</div></div>
        </div>
        <div className="grid grid-cols-6 gap-4 text-[13px] mt-4 pt-4 border-t">
          <div><span className="text-muted-foreground">额度</span><div className="text-foreground font-medium mt-0.5">{rule.quota.toLocaleString()} {cap?.unit}</div></div>
          <div><span className="text-muted-foreground">周期</span><div className="text-foreground mt-0.5">{PERIOD_TYPES.find((p) => p.value === rule.periodType)?.label}{rule.periodValue > 0 ? ` · ${rule.periodValue}` : ""}</div></div>
          <div><span className="text-muted-foreground">发放方式</span><div className="text-foreground mt-0.5">{GRANT_TYPES.find((g) => g.value === rule.grantType)?.label}</div></div>
          <div><span className="text-muted-foreground">是否累积</span><div className={`mt-0.5 font-medium ${rule.isCumulative ? "text-primary" : "text-muted-foreground"}`}>{rule.isCumulative ? "是" : "否"}</div></div>
          <div><span className="text-muted-foreground">过期策略</span><div className="text-foreground mt-0.5">{EXPIRE_POLICIES.find((e) => e.value === rule.expirePolicy)?.label}</div></div>
          <div><span className="text-muted-foreground">引用SKU</span><div className={`font-medium mt-0.5 ${skus.length > 0 ? "text-primary" : "text-muted-foreground"}`}>{skus.length}</div></div>
        </div>
        {rule.description && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t">{rule.description}</p>}
      </div>

      {/* Relationship chain */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">关联关系链</h3>
        <div className="flex items-center gap-3 text-[13px]">
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">应用</div>
            {app ? <Link to={`/entitlement/app/detail/${app.id}`} className="text-primary hover:underline font-medium">{app.name}</Link> : <span>—</span>}
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">能力</div>
            {cap ? <Link to={`/entitlement/capability/detail/${cap.id}`} className="text-primary hover:underline font-medium">{cap.name}</Link> : <span>—</span>}
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border border-primary/40 bg-primary/5 text-center">
            <div className="text-[11px] text-primary mb-1">当前规则</div>
            <span className="font-semibold text-foreground">{rule.name}</span>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">商品SKU</div>
            <span className="text-primary font-medium">{skus.length}个</span>
          </div>
        </div>
      </div>

      {/* Referenced SKUs */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">引用此规则的商品 ({skus.length})</h3>
        <div className="space-y-2">
          {skus.map((s) => (
            <Link key={s.id} to={`/entitlement/sku/detail/${s.id}`} className="flex items-center justify-between px-4 py-3 rounded-lg border hover:border-primary/40 hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground text-[13px]">{s.name}</span>
                <code className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{s.code}</code>
                <span className="text-[12px] text-muted-foreground">{BILLING_CYCLES.find((b) => b.value === s.billingCycle)?.label}</span>
              </div>
              <span className={`font-medium text-[13px] ${s.price > 0 ? "text-foreground" : "text-muted-foreground"}`}>{s.price > 0 ? `¥${s.price}` : "¥0"}</span>
            </Link>
          ))}
          {skus.length === 0 && <p className="text-[13px] text-muted-foreground text-center py-4">暂无商品引用此规则</p>}
        </div>
      </div>

      {bundles.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">涉及的套餐 ({bundles.length})</h3>
          <div className="flex flex-wrap gap-2">
            {bundles.map((b) => (
              <Link key={b.id} to={`/entitlement/package/detail/${b.id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-primary/40 text-[12px]">
                <span className="font-medium text-foreground">{b.name}</span>
                <span className="text-muted-foreground">{b.price > 0 ? `¥${b.price}/${BILLING_CYCLES.find((c) => c.value === b.billingCycle)?.label}` : "免费"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
