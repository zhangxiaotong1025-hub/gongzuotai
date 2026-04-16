import { useState } from "react";
import { Phone, MessageSquare, MapPin, Clock, ChevronRight, Search, Filter, Zap } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateMerchantLeads, LEAD_STATUS_MAP } from "@/data/merchant";
import type { MerchantLead } from "@/data/merchant";

const LEADS = generateMerchantLeads(30);

const STATUS_TABS: { key: MerchantLead["status"] | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending_contact", label: "待联系" },
  { key: "contacted", label: "已联系" },
  { key: "interested", label: "意向中" },
  { key: "visited", label: "已约见" },
  { key: "signed", label: "已签单" },
  { key: "lost", label: "已流失" },
];

export default function MerchantLeads() {
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = LEADS.filter((l) => (tab === "all" || l.status === tab) && (!search || l.name.includes(search) || l.phone.includes(search)));
  const detail = selected ? LEADS.find((l) => l.id === selected) : null;

  return (
    <div className="space-y-4">
      <PageHeader title="我的客资" subtitle="平台派发线索 · 及时跟进提升转化" />

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-border/40 pb-2">
        {STATUS_TABS.map((t) => {
          const count = t.key === "all" ? LEADS.length : LEADS.filter((l) => l.status === t.key).length;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-[12px] rounded-md transition-all ${tab === t.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/60"}`}>
              {t.label} <span className="ml-1 text-[10px]">({count})</span>
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="relative w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索客户" className="h-8 pl-8 text-[12px]" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Lead list */}
        <div className="col-span-5 space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
          {filtered.map((l) => {
            const st = LEAD_STATUS_MAP[l.status];
            return (
              <div key={l.id} onClick={() => setSelected(l.id)}
                className={`rounded-lg border p-3 cursor-pointer transition-all ${selected === l.id ? "border-primary/50 bg-primary/5" : "border-border/40 hover:border-border"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium">{l.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{l.assignedAt}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{l.category}</span>
                  <span>{l.region}</span>
                  <span>AI {l.aiScore}分</span>
                  {l.budget && <span>预算{l.budget}</span>}
                </div>
                {l.nextAction && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-500">
                    <Clock className="h-3 w-3" /> {l.nextAction}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="col-span-7 rounded-xl border border-border/60 bg-card p-5">
          {detail ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">{detail.name}</h3>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{detail.phone} · {detail.region} · {detail.category}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-8"><Phone className="h-3.5 w-3.5 mr-1" /> 拨打电话</Button>
                  <Button size="sm" variant="outline" className="text-xs h-8"><MessageSquare className="h-3.5 w-3.5 mr-1" /> 发送消息</Button>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/40 p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{detail.aiScore}</div>
                  <div className="text-[10px] text-muted-foreground">AI评分</div>
                </div>
                <div className="rounded-lg border border-border/40 p-3 text-center">
                  <div className="text-[13px] font-bold">{detail.intentLevel === "high" ? "高" : detail.intentLevel === "medium" ? "中" : "低"}</div>
                  <div className="text-[10px] text-muted-foreground">意向等级</div>
                </div>
                <div className="rounded-lg border border-border/40 p-3 text-center">
                  <div className="text-[13px] font-bold">{detail.budget || "-"}</div>
                  <div className="text-[10px] text-muted-foreground">预算范围</div>
                </div>
              </div>

              {/* AI suggestion */}
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <div className="text-[11px] font-medium text-primary flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> AI跟进建议
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {detail.status === "pending_contact"
                    ? "该客户AI评分较高，建议在24小时内完成首次电话联系，上午10-11点为最佳联系时段。"
                    : detail.status === "contacted"
                    ? "客户已表达兴趣，建议发送同小区/同户型的成功案例，并在3天内预约上门量房。"
                    : "持续保持沟通，根据客户关注点定制方案，注意竞品对比分析。"}
                </div>
              </div>

              {/* Follow-up timeline */}
              <div>
                <h4 className="text-[12px] font-semibold mb-3">跟进时间线</h4>
                {detail.followUps.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border/60">
                    {detail.followUps.map((f) => (
                      <div key={f.id} className="flex gap-3 pl-5 relative">
                        <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-primary/40 bg-card flex items-center justify-center">
                          <div className="w-[5px] h-[5px] rounded-full bg-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium">{f.type === "call" ? "📞 电话" : f.type === "wechat" ? "💬 微信" : f.type === "visit" ? "🏠 上门" : "📋 报价"}</span>
                            <span className="text-[10px] text-muted-foreground">{f.time}</span>
                          </div>
                          <div className="text-[11px] text-foreground mt-0.5">{f.content}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">结果：{f.result}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[11px] text-muted-foreground">暂无跟进记录，请尽快联系客户</div>
                )}
              </div>

              {/* Add follow-up */}
              <Button size="sm" className="w-full text-xs">+ 添加跟进记录</Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[12px] text-muted-foreground py-20">
              ← 选择一条线索查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
