import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Play, Pause, BarChart3, Users, Send, Gift, Ticket, Package } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateSegments, generateCampaigns,
  type CustomerSegment, type MarketingCampaign,
  CAMPAIGN_TYPE_MAP, CAMPAIGN_STATUS_MAP,
} from "@/data/customer";

const SEGMENTS = generateSegments();
const CAMPAIGNS = generateCampaigns();

const TABS = ["客户分群", "营销活动", "转化效果"];

/* ── Segment Columns ── */
const segCols: TableColumn<CustomerSegment>[] = [
  { key: "name", title: "分群名称", width: 150, render: (_v, r) => (
    <div><div className="text-sm font-medium">{r.name}</div><div className="text-[11px] text-muted-foreground mt-0.5">{r.description}</div></div>
  )},
  { key: "type", title: "类型", width: 80, render: (v: string) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${v === "preset" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>
      {v === "preset" ? "系统预设" : "自定义"}
    </span>
  )},
  { key: "customerCount", title: "客户数", width: 80, render: (v: number) => <span className="text-sm font-medium">{v}</span> },
  { key: "conditions", title: "分群条件", width: 180, render: (v: string) => <span className="text-xs text-muted-foreground">{v}</span> },
  { key: "lastSyncedAt", title: "最后同步", width: 140, render: (v: string) => <span className="text-xs text-muted-foreground">{v}</span> },
  { key: "status", title: "状态", width: 70, render: (v: string) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${v === "active" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
      {v === "active" ? "启用" : "停用"}
    </span>
  )},
];

/* ── Campaign Columns ── */
const cmpCols: TableColumn<MarketingCampaign>[] = [
  { key: "name", title: "活动名称", width: 180, render: (_v, r) => (
    <div><div className="text-sm font-medium">{r.name}</div><div className="text-[11px] text-muted-foreground mt-0.5">{r.startAt} ~ {r.endAt}</div></div>
  )},
  { key: "type", title: "类型", width: 90, render: (v: string) => {
    const icons: Record<string, React.ReactNode> = { entitlement_grant: <Gift className="h-3 w-3" />, coupon: <Ticket className="h-3 w-3" />, message: <Send className="h-3 w-3" />, exclusive_package: <Package className="h-3 w-3" /> };
    return <span className="inline-flex items-center gap-1 text-xs"><span>{icons[v]}</span>{CAMPAIGN_TYPE_MAP[v]}</span>;
  }},
  { key: "segmentName", title: "目标分群", width: 100 },
  { key: "targetCount", title: "目标人数", width: 80, render: (v: number) => <span className="text-sm">{v}</span> },
  { key: "status", title: "状态", width: 80, render: (v: string) => {
    const s = CAMPAIGN_STATUS_MAP[v];
    return s ? <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${s.color}`}>{s.label}</span> : v;
  }},
  { key: "reachCount", title: "触达", width: 60, render: (v: number) => <span className="text-sm">{v}</span> },
  { key: "convertCount", title: "转化", width: 60, render: (v: number) => <span className="text-sm font-medium text-primary">{v}</span> },
  { key: "convertAmount", title: "转化金额", width: 90, render: (v: number) => <span className="text-sm">¥{v.toLocaleString()}</span> },
];

export default function MarketingStrategy() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [showCreateSegment, setShowCreateSegment] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newSegment, setNewSegment] = useState({ name: "", description: "", conditions: "" });
  const [newCampaign, setNewCampaign] = useState({ name: "", type: "message", segmentId: "", content: "" });

  const segActions: ActionItem<CustomerSegment>[] = [
    { label: "查看客户", onClick: () => navigate("/customer/designer") },
    { label: "创建活动", onClick: (r) => { setNewCampaign(p => ({ ...p, segmentId: r.id })); setShowCreateCampaign(true); setTab(1); } },
    { label: (r) => r.status === "active" ? "停用" : "启用", onClick: (r) => toast.success(`分群已${r.status === "active" ? "停用" : "启用"}`) },
  ];

  const cmpActions: ActionItem<MarketingCampaign>[] = [
    { label: "查看效果", onClick: () => setTab(2) },
    { label: (r) => r.status === "running" ? "暂停" : r.status === "draft" ? "发布" : "查看", onClick: (r) => toast.success(`活动操作成功`) },
  ];

  const handleCreateSegment = () => {
    if (!newSegment.name.trim()) return;
    toast.success("自定义分群创建成功");
    setShowCreateSegment(false);
    setNewSegment({ name: "", description: "", conditions: "" });
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name.trim()) return;
    toast.success("营销活动创建成功");
    setShowCreateCampaign(false);
    setNewCampaign({ name: "", type: "message", segmentId: "", content: "" });
  };

  // Conversion stats
  const totalReach = CAMPAIGNS.reduce((a, c) => a + c.reachCount, 0);
  const totalConvert = CAMPAIGNS.reduce((a, c) => a + c.convertCount, 0);
  const totalAmount = CAMPAIGNS.reduce((a, c) => a + c.convertAmount, 0);
  const overallRate = totalReach > 0 ? Math.round((totalConvert / totalReach) * 100) : 0;

  return (
    <div>
      <PageHeader title="营销策略" subtitle="客户分群与精准触达" />

      <div className="flex items-center gap-1 mb-5 border-b border-border/60">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t}</button>
        ))}
      </div>

      {/* Tab 0: Segments */}
      {tab === 0 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowCreateSegment(true)}><Plus className="h-4 w-4 mr-1" />创建自定义分群</Button>
          </div>

          {showCreateSegment && (
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
              <h4 className="text-sm font-medium">创建自定义分群</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">分群名称 <span className="text-destructive">*</span></label>
                  <input className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="如：高消费设计师" value={newSegment.name} onChange={e => setNewSegment(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">描述</label>
                  <input className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="分群说明" value={newSegment.description} onChange={e => setNewSegment(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">筛选条件</label>
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border/60 bg-background min-h-[60px]">
                  {["客户类型", "生命周期阶段", "套餐类型", "权益使用率", "消费金额", "注册时间", "标签", "来源渠道"].map(c => (
                    <button key={c} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">{c}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreateSegment(false)}>取消</Button>
                <Button size="sm" onClick={handleCreateSegment}>创建分群</Button>
              </div>
            </div>
          )}

          <AdminTable columns={segCols} data={SEGMENTS} actions={segActions} rowKey={(r) => r.id} />
        </div>
      )}

      {/* Tab 1: Campaigns */}
      {tab === 1 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowCreateCampaign(true)}><Plus className="h-4 w-4 mr-1" />创建活动</Button>
          </div>

          {showCreateCampaign && (
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
              <h4 className="text-sm font-medium">创建营销活动</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">活动名称 <span className="text-destructive">*</span></label>
                  <input className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="如：春季续费优惠" value={newCampaign.name} onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">活动类型</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(CAMPAIGN_TYPE_MAP).map(([k, v]) => (
                      <button key={k} onClick={() => setNewCampaign(p => ({ ...p, type: k }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${newCampaign.type === k ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
                      >{v}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">目标分群</label>
                <div className="flex gap-2 flex-wrap">
                  {SEGMENTS.map(s => (
                    <button key={s.id} onClick={() => setNewCampaign(p => ({ ...p, segmentId: s.id }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${newCampaign.segmentId === s.id ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
                    >{s.name} ({s.customerCount}人)</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">活动内容</label>
                <textarea className="w-full h-20 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="请输入活动配置内容..." value={newCampaign.content} onChange={e => setNewCampaign(p => ({ ...p, content: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreateCampaign(false)}>取消</Button>
                <Button size="sm" onClick={handleCreateCampaign}>创建活动</Button>
              </div>
            </div>
          )}

          <AdminTable columns={cmpCols} data={CAMPAIGNS} actions={cmpActions} rowKey={(r) => r.id} />
        </div>
      )}

      {/* Tab 2: Conversion Tracking */}
      {tab === 2 && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "总触达人数", value: totalReach, prefix: "" },
              { label: "总转化人数", value: totalConvert, prefix: "" },
              { label: "总体转化率", value: `${overallRate}%`, prefix: "" },
              { label: "转化总金额", value: `¥${totalAmount.toLocaleString()}`, prefix: "" },
              { label: "活动数", value: CAMPAIGNS.length, prefix: "" },
            ].map(k => (
              <div key={k.label} className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <div className="text-2xl font-bold text-primary">{k.prefix}{k.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Per-campaign effect */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4">各活动转化效果</h4>
            <div className="space-y-4">
              {CAMPAIGNS.map(c => {
                const reachRate = c.targetCount > 0 ? Math.round((c.reachCount / c.targetCount) * 100) : 0;
                const convertRate = c.reachCount > 0 ? Math.round((c.convertCount / c.reachCount) * 100) : 0;
                return (
                  <div key={c.id} className="p-4 rounded-lg border border-border/40">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{CAMPAIGN_TYPE_MAP[c.type]} · {c.segmentName}</div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${CAMPAIGN_STATUS_MAP[c.status].color}`}>{CAMPAIGN_STATUS_MAP[c.status].label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div><div className="text-sm font-medium">{c.targetCount}</div><div className="text-[10px] text-muted-foreground">目标</div></div>
                      <div><div className="text-sm font-medium">{c.reachCount} <span className="text-[10px] text-muted-foreground">({reachRate}%)</span></div><div className="text-[10px] text-muted-foreground">触达</div></div>
                      <div><div className="text-sm font-medium text-primary">{c.convertCount} <span className="text-[10px] text-muted-foreground">({convertRate}%)</span></div><div className="text-[10px] text-muted-foreground">转化</div></div>
                      <div><div className="text-sm font-medium">¥{c.convertAmount.toLocaleString()}</div><div className="text-[10px] text-muted-foreground">金额</div></div>
                    </div>
                    {/* Funnel bar */}
                    <div className="flex gap-1 mt-3 h-2">
                      <div className="bg-blue-400 rounded-l" style={{ width: `${reachRate}%` }} title="触达率" />
                      <div className="bg-primary rounded-r" style={{ width: `${convertRate}%` }} title="转化率" />
                      <div className="flex-1 bg-muted rounded-r" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
