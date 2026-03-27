import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { accountData, orderData, appData, skuData, bundleData, ORDER_STATUS, ORDER_TYPES, GRANT_TYPES, getAccountStats, getAccountHealth, getRule, getCapability, type EntitlementAccount, type OrderItem } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/admin/Pagination";
import { Building2, User, Plus, Eye, TrendingUp, TrendingDown, Minus, Heart, Activity, RefreshCw, Target, AlertTriangle, Lightbulb, Clock, Users, Zap } from "lucide-react";
import { OrderDialog } from "./dialogs/OrderDialog";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

/* ── Health Level Config ── */
const HEALTH_CFG = {
  excellent: { label: "优秀", color: "hsl(var(--success))", bg: "hsl(var(--success) / 0.08)", border: "hsl(var(--success) / 0.2)" },
  good:      { label: "良好", color: "hsl(var(--primary))", bg: "hsl(var(--primary) / 0.08)", border: "hsl(var(--primary) / 0.2)" },
  warning:   { label: "预警", color: "hsl(var(--warning))", bg: "hsl(var(--warning) / 0.08)", border: "hsl(var(--warning) / 0.2)" },
  critical:  { label: "危险", color: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.08)", border: "hsl(var(--destructive) / 0.2)" },
};

/* ── Score Ring Component ── */
function ScoreRing({ score, size = 100, strokeWidth = 8, color }: { score: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

/* ── Trend Icon ── */
function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--success))]" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function AccountDetail() {
  const { id } = useParams();
  const accIndex = accountData.findIndex((a) => a.id === id);
  const acc = accIndex >= 0 ? accountData[accIndex] : null;

  const [appFilter, setAppFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [allocPage, setAllocPage] = useState(1);
  const [allocPageSize, setAllocPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAllocate = useCallback((_form: any) => {
    toast.success("权益已分配，订单已自动生成");
    setDialogOpen(false);
  }, []);

  if (!acc) return <div className="p-10 text-center text-muted-foreground">账户不存在</div>;

  const prevAcc = accIndex > 0 ? accountData[accIndex - 1] : null;
  const nextAcc = accIndex < accountData.length - 1 ? accountData[accIndex + 1] : null;
  const stats = getAccountStats(acc);
  const health = getAccountHealth(acc.id);
  const hcfg = HEALTH_CFG[health.healthLevel];

  // Filtered allocations
  const filteredAllocs = acc.allocations.filter((a) => {
    if (appFilter !== "all" && a.appId !== appFilter) return false;
    if (typeFilter !== "all" && a.itemType !== typeFilter) return false;
    return true;
  });
  const pagedAllocs = filteredAllocs.slice((allocPage - 1) * allocPageSize, allocPage * allocPageSize);

  // Group capabilities by capabilityId
  const grouped = acc.capabilities.reduce((map, cap) => {
    if (!map[cap.capabilityId]) map[cap.capabilityId] = [];
    map[cap.capabilityId].push(cap);
    return map;
  }, {} as Record<string, typeof acc.capabilities>);

  const relatedOrders = orderData.filter((o) => acc.orderIds.includes(o.id));

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="权益账户"
        backPath="/entitlement/account"
        currentName={`${acc.customerName} - 权益详情`}
        prevPath={prevAcc ? `/entitlement/account/detail/${prevAcc.id}` : null}
        nextPath={nextAcc ? `/entitlement/account/detail/${nextAcc.id}` : null}
      />

      {/* 概览头部 — 渐变卡片 */}
      <div className="rounded-xl p-6 text-white" style={{
        background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(260 60% 55%) 50%, hsl(280 55% 50%) 100%)",
      }}>
        <div className="flex items-center gap-3 mb-1">
          {acc.customerType === "B" ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
          <h2 className="text-[18px] font-bold">{acc.customerName}</h2>
        </div>
        <p className="text-white/70 text-[13px] mb-5">企业ID: {acc.customerId}</p>
        <div className="grid grid-cols-5 gap-6">
          <div>
            <div className="text-white/60 text-[12px]">综合健康度</div>
            <div className="text-[20px] font-bold mt-0.5 flex items-center gap-2">
              {health.healthScore}分
              <span className="text-[12px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.15)" }}>
                {hcfg.label}
              </span>
            </div>
          </div>
          <div>
            <div className="text-white/60 text-[12px]">总使用率</div>
            <div className="text-[20px] font-bold mt-0.5">{stats.usageRate}%</div>
          </div>
          <div>
            <div className="text-white/60 text-[12px]">续订率</div>
            <div className="text-[20px] font-bold mt-0.5">{health.renewalRate}%</div>
          </div>
          <div>
            <div className="text-white/60 text-[12px]">意向度</div>
            <div className="text-[20px] font-bold mt-0.5">{health.intentScore}分</div>
          </div>
          <div>
            <div className="text-white/60 text-[12px]">活跃用户</div>
            <div className="text-[20px] font-bold mt-0.5">{health.activeUsers}/{health.totalUsers}人</div>
          </div>
        </div>
      </div>

      {/* ═══ 健康度分析面板 ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* 左：综合健康度 + 核心指标 */}
        <div className="col-span-4 bg-card rounded-xl border p-5 space-y-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4" style={{ color: hcfg.color }} /> 综合健康度
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative">
              <ScoreRing score={health.healthScore} size={120} strokeWidth={10} color={hcfg.color} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[28px] font-bold text-foreground">{health.healthScore}</span>
                <span className="text-[11px] font-medium" style={{ color: hcfg.color }}>{hcfg.label}</span>
              </div>
            </div>
          </div>
          {/* 核心指标卡片 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3 border" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">最近登录</span>
              </div>
              <span className={`text-[14px] font-semibold ${health.lastLoginDays > 7 ? "text-[hsl(var(--destructive))]" : "text-foreground"}`}>
                {health.lastLoginDays === 0 ? "今天" : `${health.lastLoginDays}天前`}
              </span>
            </div>
            <div className="rounded-lg p-3 border" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">用户活跃率</span>
              </div>
              <span className="text-[14px] font-semibold text-foreground">
                {health.totalUsers > 0 ? Math.round((health.activeUsers / health.totalUsers) * 100) : 0}%
              </span>
            </div>
            <div className="rounded-lg p-3 border" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">平均会话时长</span>
              </div>
              <span className="text-[14px] font-semibold text-foreground">{health.avgSessionMinutes}分钟</span>
            </div>
            <div className="rounded-lg p-3 border" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">续订率</span>
              </div>
              <span className={`text-[14px] font-semibold ${health.renewalRate < 80 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--success))]"}`}>
                {health.renewalRate}%
              </span>
            </div>
          </div>
        </div>

        {/* 中：使用率趋势图 */}
        <div className="col-span-5 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" /> 使用率趋势（近6个月）
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={health.usageTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "使用率"]}
                  labelFormatter={(l) => `${l}`}
                />
                <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#usageGrad)" dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* 续订历史 */}
          <div className="mt-4 pt-3 border-t">
            <div className="text-[12px] text-muted-foreground font-medium mb-2">续订记录</div>
            <div className="flex gap-3">
              {health.renewalHistory.map((r) => (
                <div key={r.year} className="flex items-center gap-2 text-[12px]">
                  <span className="text-muted-foreground">{r.year}:</span>
                  {r.renewed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: "hsl(var(--success) / 0.1)", color: "hsl(var(--success))" }}>
                      ✓ 已续约 ¥{r.amount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))" }}>
                      ✗ 未续约
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右：意向度 + 信号 */}
        <div className="col-span-3 bg-card rounded-xl border p-5 space-y-4" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> 意向度分析
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative">
              <ScoreRing score={health.intentScore} size={90} strokeWidth={8} color={health.intentScore >= 70 ? "hsl(var(--success))" : health.intentScore >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-bold text-foreground">{health.intentScore}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            {health.intentSignals.map((sig, i) => (
              <div key={i} className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">{sig.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground font-medium">{sig.value}</span>
                  <TrendIcon trend={sig.trend} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 风险与机会 */}
      {(health.riskFactors.length > 0 || health.opportunities.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {health.riskFactors.length > 0 && (
            <div className="bg-card rounded-xl border p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
              <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4" style={{ color: "hsl(var(--warning))" }} /> 风险因素
              </h4>
              <div className="space-y-2">
                {health.riskFactors.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "hsl(var(--warning))" }} />
                    <span className="text-foreground">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {health.opportunities.length > 0 && (
            <div className="bg-card rounded-xl border p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
              <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4" style={{ color: "hsl(var(--success))" }} /> 增长机会
              </h4>
              <div className="space-y-2">
                {health.opportunities.map((o, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "hsl(var(--success))" }} />
                    <span className="text-foreground">{o}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 权益分配记录 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">权益分配记录</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">（按商品/套餐维度分配，点击查看每条记录包含的权益明细和实例）</p>
          </div>
          <button className="btn-primary" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> 分配权益
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-muted-foreground">所属应用：</span>
            <Select value={appFilter} onValueChange={setAppFilter}>
              <SelectTrigger className="h-8 w-[130px] text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {acc.appIds.map((id, i) => <SelectItem key={id} value={id}>{acc.appNames[i]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-muted-foreground">商品类型：</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-[100px] text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="sku">商品SKU</SelectItem>
                <SelectItem value="bundle">商品套餐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Allocation table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2.5 font-medium">分配记录ID</th>
                <th className="text-left py-2.5 font-medium">分配时间</th>
                <th className="text-left py-2.5 font-medium">商品/套餐名称</th>
                <th className="text-left py-2.5 font-medium">商品类型</th>
                <th className="text-left py-2.5 font-medium">所属应用</th>
                <th className="text-center py-2.5 font-medium">包含权益数</th>
                <th className="text-center py-2.5 font-medium">有效实例数</th>
                <th className="text-right py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedAllocs.map((alloc) => (
                <tr key={alloc.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5">
                    <Link to={`/entitlement/order/detail/${alloc.orderId}`} className="text-primary hover:underline font-mono text-[12px]">
                      {alloc.id.toUpperCase().replace("ALLOC", "ALLOC_")}
                    </Link>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{alloc.allocatedAt}</td>
                  <td className="py-2.5 font-medium">{alloc.itemName}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${alloc.itemType === "bundle" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                      {alloc.itemType === "bundle" ? "商品套餐" : "商品SKU"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <Link to={`/entitlement/app/detail/${alloc.appId}`} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary hover:bg-primary/20">
                      {alloc.appName}
                    </Link>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                      {alloc.capabilityCount}
                    </span>
                  </td>
                  <td className="py-2.5 text-center font-medium">{alloc.instanceCount}个</td>
                  <td className="py-2.5 text-right">
                    <Link to={`/entitlement/order/detail/${alloc.orderId}`} className="inline-flex items-center gap-1 text-primary hover:underline text-[12px]">
                      <Eye className="h-3 w-3" /> 查看权益明细
                    </Link>
                  </td>
                </tr>
              ))}
              {pagedAllocs.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">暂无分配记录</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredAllocs.length > 0 && (
          <div className="mt-3">
            <Pagination
              current={allocPage} total={filteredAllocs.length} pageSize={allocPageSize}
              onPageChange={setAllocPage} onPageSizeChange={(s) => { setAllocPageSize(s); setAllocPage(1); }}
            />
          </div>
        )}
      </div>

      {/* 权益能力明细 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">权益能力明细（聚合视图）</h3>
        <div className="space-y-4">
          {Object.entries(grouped).map(([capId, caps]) => {
            const capName = caps[0].capabilityName;
            return (
              <div key={capId} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Link to={`/entitlement/capability/detail/${capId}`} className="text-[13px] font-semibold text-primary hover:underline">{capName}</Link>
                  <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{caps.length}条规则</span>
                </div>
                <div className="space-y-3">
                  {caps.map((cap, idx) => {
                    const usagePercent = cap.totalQuota > 0 ? Math.round((cap.usedQuota / cap.totalQuota) * 100) : 0;
                    const isBoolean = cap.unit === "布尔";
                    return (
                      <div key={idx} className="flex items-center gap-4 text-[13px]">
                        <Link to={`/entitlement/rule/detail/${cap.ruleId}`} className="w-[180px] text-foreground hover:text-primary shrink-0 font-medium">{cap.ruleName}</Link>
                        {isBoolean ? (
                          <div className="flex-1 flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary">已开通</span>
                            <span className="text-muted-foreground text-[12px]">{cap.grantType === "ONE_TIME" ? "永久" : GRANT_TYPES.find((g) => g.value === cap.grantType)?.label}</span>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center gap-3">
                            <div className="flex-1 max-w-[200px]">
                              <Progress value={usagePercent} className={`h-2 ${usagePercent >= 80 ? "[&>div]:bg-destructive" : ""}`} />
                            </div>
                            <span className="text-muted-foreground whitespace-nowrap">
                              {cap.usedQuota.toLocaleString()}/{cap.totalQuota.toLocaleString()} {cap.unit}
                            </span>
                            <span className="text-[12px] text-muted-foreground">
                              {cap.periodType === "PERMANENT" ? "" : cap.periodType === "DAY" ? "每日刷新" : "每月"}
                            </span>
                          </div>
                        )}
                        <span className="text-[11px] text-muted-foreground shrink-0">来源: {cap.sourceOrderIds.length}个订单</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 关联订单 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">关联订单 ({relatedOrders.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">订单号</th>
              <th className="text-left py-2 font-medium">商品/套餐</th>
              <th className="text-right py-2 font-medium">金额</th>
              <th className="text-left py-2 font-medium">订单类型</th>
              <th className="text-left py-2 font-medium">订单状态</th>
              <th className="text-left py-2 font-medium">时间</th>
            </tr></thead>
            <tbody>
              {relatedOrders.map((order) => {
                const statusCfg = ORDER_STATUS.find((s) => s.value === order.orderStatus);
                const typeCfg = ORDER_TYPES.find((t) => t.value === order.orderType);
                return (
                  <tr key={order.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2"><Link to={`/entitlement/order/detail/${order.id}`} className="text-primary hover:underline font-mono text-[12px]">{order.orderNo}</Link></td>
                    <td className="py-2">{order.items.map((i) => i.itemName).join("、")}</td>
                    <td className="py-2 text-right font-medium">{order.totalAmount > 0 ? `¥${order.totalAmount}` : "¥0"}</td>
                    <td className="py-2"><span className={`text-[12px] font-medium ${typeCfg?.className || ""}`}>{typeCfg?.label}</span></td>
                    <td className="py-2"><span className={statusCfg?.className}>{statusCfg?.label}</span></td>
                    <td className="py-2 text-muted-foreground">{order.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分配权益弹窗 */}
      <OrderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleAllocate}
        initial={{
          customerType: acc.customerType,
          customerId: acc.customerId,
          customerName: acc.customerName,
          orderType: "internal_grant",
        } as any}
      />
    </div>
  );
}
