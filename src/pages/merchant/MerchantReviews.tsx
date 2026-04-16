import { Star, TrendingUp, Award } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { generateReviews } from "@/data/merchant";

const REVIEWS = generateReviews(12);

const avgScores = {
  design: +(REVIEWS.reduce((s, r) => s + r.designScore, 0) / REVIEWS.length).toFixed(1),
  construction: +(REVIEWS.reduce((s, r) => s + r.constructionScore, 0) / REVIEWS.length).toFixed(1),
  service: +(REVIEWS.reduce((s, r) => s + r.serviceScore, 0) / REVIEWS.length).toFixed(1),
  value: +(REVIEWS.reduce((s, r) => s + r.valueScore, 0) / REVIEWS.length).toFixed(1),
  overall: +(REVIEWS.reduce((s, r) => s + r.overall, 0) / REVIEWS.length).toFixed(1),
};

const dimensions = [
  { label: "设计满意度", score: avgScores.design },
  { label: "施工质量", score: avgScores.construction },
  { label: "服务态度", score: avgScores.service },
  { label: "性价比", score: avgScores.value },
];

const gradeThresholds = [
  { grade: "S", min: 4.5, color: "text-amber-400" },
  { grade: "A", min: 4.0, color: "text-emerald-500" },
  { grade: "B", min: 3.5, color: "text-blue-500" },
  { grade: "C", min: 3.0, color: "text-amber-600" },
  { grade: "D", min: 0, color: "text-red-500" },
];
const currentGrade = gradeThresholds.find((g) => avgScores.overall >= g.min)!;

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3 w-3 ${s <= Math.round(score) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`} />
      ))}
      <span className="text-[11px] font-medium ml-1">{score}</span>
    </div>
  );
}

export default function MerchantReviews() {
  return (
    <div className="space-y-5">
      <PageHeader title="客户评价" subtitle="口碑影响派单权重 · 好评驱动增长" />

      {/* Overview */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3 rounded-xl border border-border/60 bg-card p-5 flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className={`text-3xl font-black ${currentGrade.color}`}>{currentGrade.grade}</span>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{avgScores.overall}</div>
            <div className="text-[10px] text-muted-foreground">综合评分 · {REVIEWS.length}条评价</div>
          </div>
          <div className="text-[10px] text-primary flex items-center gap-1">
            <Award className="h-3 w-3" /> 优于 72% 同行商家
          </div>
        </div>

        <div className="col-span-5 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">分维度评分</h3>
          <div className="space-y-3">
            {dimensions.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground w-20 text-right shrink-0">{d.label}</span>
                <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400/70 transition-all" style={{ width: `${(d.score / 5) * 100}%` }} />
                </div>
                <span className="text-[11px] font-medium w-8">{d.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">等级影响</h3>
          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="font-medium text-emerald-500">S/A级商家</span>
              <div className="text-[10px] text-muted-foreground mt-0.5">优先获得高质量线索，享受线索折扣价</div>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <span className="font-medium text-blue-500">B级商家</span>
              <div className="text-[10px] text-muted-foreground mt-0.5">正常派发，标准定价</div>
            </div>
            <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
              <span className="font-medium text-red-500">C/D级商家</span>
              <div className="text-[10px] text-muted-foreground mt-0.5">限制派发量，需改善后重新评级</div>
            </div>
          </div>
        </div>
      </div>

      {/* Review list */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">评价记录</h3>
        <div className="space-y-3">
          {REVIEWS.map((r) => (
            <div key={r.id} className="flex items-start gap-4 p-3 rounded-lg border border-border/30">
              <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-[12px] font-medium shrink-0">
                {r.customerName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium">{r.customerName}</span>
                  <span className="text-[10px] text-muted-foreground">{r.createdAt}</span>
                </div>
                <StarRating score={r.overall} />
                <div className="text-[11px] text-muted-foreground mt-1">{r.comment}</div>
                <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  <span>设计{r.designScore}</span>
                  <span>施工{r.constructionScore}</span>
                  <span>服务{r.serviceScore}</span>
                  <span>性价比{r.valueScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
