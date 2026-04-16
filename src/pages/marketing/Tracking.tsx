import {
  AlertTriangle, CheckCircle2, Clock, ArrowRight,
  MessageSquare, Phone, Eye,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateTrackingItems, TRACKING_STAGE_MAP,
  type TrackingItem, type TrackingStage,
} from "@/data/marketing";

const ITEMS = generateTrackingItems();

const KANBAN_STAGES: TrackingStage[] = ["distributed", "contacted", "visited", "measured", "quoted", "signed", "lost"];

function KanbanCard({ item }: { item: TrackingItem }) {
  return (
    <div className={`rounded-lg border p-3 space-y-2 ${item.isOverdue ? "border-red-500/30 bg-red-500/5" : "border-border/40 bg-card"}`}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium">{item.leadName}</span>
        {item.isOverdue && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium flex items-center gap-0.5">
            <AlertTriangle className="h-2.5 w-2.5" />
            {item.overdueType === "no_contact" ? "未联系" : item.overdueType === "no_progress" ? "无进展" : "无反馈"}
          </span>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground">{item.phone}</div>
      <div className="text-[10px] text-primary">{item.enterpriseName}</div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          <Clock className="inline h-2.5 w-2.5 mr-0.5" />
          {item.daysInStage}天
        </span>
        <span className="text-[10px] text-muted-foreground">
          <MessageSquare className="inline h-2.5 w-2.5 mr-0.5" />
          {item.feedbackCount}条
        </span>
      </div>
      {item.notes.length > 0 && (
        <div className="text-[10px] text-muted-foreground border-t border-border/30 pt-1.5 line-clamp-1">
          最新: {item.notes[item.notes.length - 1]}
        </div>
      )}
    </div>
  );
}

export default function Tracking() {
  const overdueCount = ITEMS.filter((i) => i.isOverdue).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="跟进追踪"
        description="企业跟进看板 · 超时预警 · 反馈催促"
        actions={
          <div className="flex gap-2">
            {overdueCount > 0 && (
              <Button variant="destructive" size="sm" className="text-xs" onClick={() => toast.info("批量催促（规划中）")}>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" /> {overdueCount}条超时
              </Button>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "总派发", value: ITEMS.length, color: "text-foreground" },
          { label: "已联系", value: ITEMS.filter((i) => i.firstContactAt).length, color: "text-blue-500" },
          { label: "已签约", value: ITEMS.filter((i) => i.stage === "signed").length, color: "text-emerald-600" },
          { label: "已流失", value: ITEMS.filter((i) => i.stage === "lost").length, color: "text-red-500" },
          { label: "超时预警", value: overdueCount, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border/60 bg-card p-3 text-center">
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_STAGES.map((stage) => {
          const stageItems = ITEMS.filter((i) => i.stage === stage);
          const info = TRACKING_STAGE_MAP[stage];
          return (
            <div key={stage} className="min-w-[200px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`w-2 h-2 rounded-full ${info.color}`} />
                <span className="text-[12px] font-semibold">{info.label}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{stageItems.length}</span>
              </div>
              <div className="space-y-2">
                {stageItems.map((item) => (
                  <KanbanCard key={item.id} item={item} />
                ))}
                {stageItems.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border/40 p-4 text-center text-[10px] text-muted-foreground">
                    暂无数据
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Incentive mechanisms */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">反馈激励机制</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { title: "质量保障金", desc: "预收20%保障金，反馈率≥60%时释放", status: "可启动" },
            { title: "积分兑客资", desc: "每条有效反馈积10分，积分可兑换优质客资", status: "规划中" },
            { title: "动态定价", desc: "反馈率高→优惠价，反馈率低→提价", status: "规划中" },
            { title: "AI自动催促", desc: "24h未反馈自动发送催促通知", status: "可启动" },
          ].map((m) => (
            <div key={m.title} className="rounded-lg border border-border/40 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium">{m.title}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${m.status === "可启动" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                  {m.status}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
