import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Brain, Activity, Heart, Target, Sparkles, Zap, Eye, Users, Star, Clock,
  Lightbulb, TrendingUp, Shield,
} from "lucide-react";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
export interface BehaviorTrait {
  label: string;
  level: "high" | "medium" | "low";
  score: number;
  evidence: string;
  icon: React.ElementType;
}
export interface PersonalityTrait {
  dimension: string;
  score: number;
  leftLabel: string;
  rightLabel: string;
  desc: string;
}
export interface DeepNeed {
  category: string;
  need: string;
  urgency: "urgent" | "normal" | "latent";
  importance: number; // 0-100
  basis: string;
  suggestion: string;
  icon: React.ElementType;
}
export interface DesignPreference {
  dimension: string;
  preference: string;
  confidence: number;
  basis: string;
}
export interface PortraitData {
  behaviorTraits: BehaviorTrait[];
  personalityTraits: PersonalityTrait[];
  deepNeeds: DeepNeed[];
  designPreferences: DesignPreference[];
  behaviorSummary: string;
  personalitySummary: string;
  needsSummary: string;
  radarDimensions: { name: string; value: number }[];
  persona: string;
  personaDesc: string;
  healthScore: number;
  activityHeatmap: number[][]; // 7 days x 24 hours
  interestBubbles: { name: string; weight: number; color: string }[];
  journeyStages: { name: string; status: "done" | "current" | "future"; metric: string }[];
}

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */
export const DESIGNER_PORTRAIT: PortraitData = {
  persona: "效率创作型",
  personaDesc: "高频使用 AI 工具快速出图，注重效率与投入产出比",
  healthScore: 78,
  behaviorSummary: "高频创作驱动型用户，偏好AI辅助快速出图，对新功能接受度高。",
  personalitySummary: "理性务实的效率主义者，注重投入产出比。",
  needsSummary: "提升出图效率和客户成交率，潜在需求是专业品牌建设。",
  radarDimensions: [
    { name: "创作活跃", value: 82 }, { name: "工具深度", value: 65 },
    { name: "付费意愿", value: 78 }, { name: "分享传播", value: 45 },
    { name: "学习成长", value: 70 }, { name: "客户服务", value: 58 },
  ],
  activityHeatmap: [
    [0,0,0,0,0,0,1,3,8,12,15,10,5,9,18,22,15,8,4,2,1,0,0,0],
    [0,0,0,0,0,1,2,5,10,14,18,12,6,11,20,25,18,10,5,3,1,0,0,0],
    [0,0,0,0,0,0,1,4,9,11,14,8,4,8,15,19,14,7,3,2,0,0,0,0],
    [0,0,0,0,0,1,2,6,12,16,20,14,7,12,22,28,20,12,6,4,2,1,0,0],
    [0,0,0,0,0,0,1,5,11,15,18,11,5,10,19,24,17,9,4,2,1,0,0,0],
    [0,0,0,0,0,0,0,2,4,6,8,5,3,4,6,8,5,3,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,3,4,2,1,2,3,4,2,1,0,0,0,0,0,0],
  ],
  interestBubbles: [
    { name: "AI设计", weight: 89, color: "bg-primary" },
    { name: "3D渲染", weight: 71, color: "bg-blue-500" },
    { name: "方案导出", weight: 54, color: "bg-emerald-500" },
    { name: "模型下载", weight: 38, color: "bg-amber-500" },
    { name: "VR全景", weight: 25, color: "bg-violet-500" },
    { name: "智能家居", weight: 18, color: "bg-pink-500" },
    { name: "全屋定制", weight: 65, color: "bg-cyan-500" },
    { name: "高端住宅", weight: 72, color: "bg-indigo-500" },
  ],
  journeyStages: [
    { name: "注册", status: "done", metric: "2024-03" },
    { name: "首次付费", status: "done", metric: "5天" },
    { name: "活跃使用", status: "done", metric: "22天/月" },
    { name: "升级套餐", status: "done", metric: "2次" },
    { name: "推荐他人", status: "current", metric: "3人" },
    { name: "品牌大使", status: "future", metric: "—" },
  ],
  behaviorTraits: [
    { label: "高频创作", score: 92, level: "high", evidence: "月均42套 Top 8%", icon: Zap },
    { label: "效率优先", score: 88, level: "high", evidence: "方案耗时 4.2→1.8h", icon: Activity },
    { label: "渲染敏感", score: 65, level: "medium", evidence: "3D 71% · 4K 16%", icon: Eye },
    { label: "功能探索", score: 58, level: "medium", evidence: "6/8 核心功能", icon: Lightbulb },
    { label: "社交传播", score: 35, level: "low", evidence: "公开分享 3次/月", icon: Users },
    { label: "学习意愿", score: 70, level: "medium", evidence: "教程完成率 78%", icon: Brain },
  ],
  personalityTraits: [
    { dimension: "决策风格", score: 75, leftLabel: "感性", rightLabel: "理性", desc: "数据驱动型" },
    { dimension: "价格敏感", score: 40, leftLabel: "敏感", rightLabel: "不敏感", desc: "价值导向" },
    { dimension: "社交倾向", score: 45, leftLabel: "内向", rightLabel: "外向", desc: "私域影响力" },
    { dimension: "风险偏好", score: 60, leftLabel: "保守", rightLabel: "进取", desc: "谨慎尝鲜" },
    { dimension: "品牌忠诚", score: 72, leftLabel: "低", rightLabel: "高", desc: "持续续费" },
  ],
  deepNeeds: [
    { category: "效率", need: "缩短全流程出图时间", urgency: "urgent", importance: 95, basis: "频繁批量渲染", suggestion: "智能方案模板", icon: Zap },
    { category: "获客", need: "建立个人品牌", urgency: "normal", importance: 70, basis: "从未展示作品", suggestion: "设计师主页", icon: Target },
    { category: "品质", need: "提升交付专业度", urgency: "normal", importance: 65, basis: "4K使用率低", suggestion: "赠送体验额度", icon: Star },
    { category: "成长", need: "拓展风格范围", urgency: "latent", importance: 45, basis: "78%现代简约", suggestion: "新中式模板", icon: TrendingUp },
  ],
  designPreferences: [
    { dimension: "设计风格", preference: "现代简约", confidence: 95, basis: "78% 方案" },
    { dimension: "色彩倾向", preference: "低饱和暖色", confidence: 82, basis: "67% 材质" },
    { dimension: "空间类型", preference: "住宅全屋", confidence: 90, basis: "客厅优先" },
    { dimension: "材质偏好", preference: "实木+石材", confidence: 75, basis: "木质 52%" },
    { dimension: "渲染偏好", preference: "自然光·45°", confidence: 88, basis: "79% 自然光" },
  ],
};

export const EC_PORTRAIT: PortraitData = {
  persona: "品质决策型",
  personaDesc: "重视设计效果直观感受，追求高品质一站式服务体验",
  healthScore: 85,
  behaviorSummary: "决策周期87天的高净值客户，重视设计效果直观感受。",
  personalitySummary: "注重细节的品质追求者，信任专业建议但需视觉验证。",
  needsSummary: "省心且高品质的一站式装修体验。",
  radarDimensions: [
    { name: "意向度", value: 92 }, { name: "满意度", value: 88 },
    { name: "合作深度", value: 75 }, { name: "转介绍", value: 60 },
    { name: "预算力", value: 85 }, { name: "配合度", value: 78 },
  ],
  activityHeatmap: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,5,4,2,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,6,5,2,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,3,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,8,6,3,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,5,4,1,0],
    [0,0,0,0,0,0,0,0,0,1,2,3,2,1,2,3,2,1,0,1,2,1,0,0],
    [0,0,0,0,0,0,0,0,0,2,3,4,3,2,3,4,3,2,1,1,1,0,0,0],
  ],
  interestBubbles: [
    { name: "全屋定制", weight: 92, color: "bg-primary" },
    { name: "现代简约", weight: 85, color: "bg-blue-500" },
    { name: "橱柜", weight: 78, color: "bg-emerald-500" },
    { name: "衣柜", weight: 72, color: "bg-amber-500" },
    { name: "收纳方案", weight: 68, color: "bg-cyan-500" },
    { name: "软装搭配", weight: 45, color: "bg-violet-500" },
    { name: "智能家居", weight: 30, color: "bg-pink-500" },
    { name: "环保材质", weight: 55, color: "bg-indigo-500" },
  ],
  journeyStages: [
    { name: "录入", status: "done", metric: "2025-08" },
    { name: "首次沟通", status: "done", metric: "12天" },
    { name: "方案确认", status: "done", metric: "31天" },
    { name: "到店体验", status: "done", metric: "51天" },
    { name: "签约", status: "done", metric: "87天" },
    { name: "增购复购", status: "current", metric: "72%" },
  ],
  behaviorTraits: [
    { label: "视觉决策", score: 90, level: "high", evidence: "80% 看效果图", icon: Eye },
    { label: "多方比较", score: 85, level: "high", evidence: "3平台对比", icon: Users },
    { label: "品质导向", score: 88, level: "high", evidence: "均价+35%", icon: Star },
    { label: "沟通稳定", score: 65, level: "medium", evidence: "每周1次", icon: Clock },
    { label: "需要推动", score: 55, level: "medium", evidence: "确认耗22天", icon: Shield },
  ],
  personalityTraits: [
    { dimension: "决策风格", score: 35, leftLabel: "感性", rightLabel: "理性", desc: "视觉驱动" },
    { dimension: "价格敏感", score: 30, leftLabel: "敏感", rightLabel: "不敏感", desc: "品质优先" },
    { dimension: "参与度", score: 80, leftLabel: "被动", rightLabel: "主动", desc: "积极参与" },
    { dimension: "信任速度", score: 65, leftLabel: "慢", rightLabel: "快", desc: "需验证" },
    { dimension: "传播意愿", score: 55, leftLabel: "低", rightLabel: "高", desc: "需激励" },
  ],
  deepNeeds: [
    { category: "品质", need: "一站式全屋定制", urgency: "urgent", importance: 95, basis: "全品类合同", suggestion: "管家服务", icon: Shield },
    { category: "体验", need: "施工透明可视", urgency: "normal", importance: 72, basis: "3次询问进度", suggestion: "工地直播", icon: Eye },
    { category: "延伸", need: "软装+智能家居", urgency: "latent", importance: 50, basis: "2次提到软装", suggestion: "完工70%推方案", icon: Heart },
  ],
  designPreferences: [
    { dimension: "风格", preference: "现代简约", confidence: 90, basis: "3次均选简洁" },
    { dimension: "色调", preference: "奶油白+原木", confidence: 85, basis: "参考图90%暖白" },
    { dimension: "功能", preference: "收纳优先", confidence: 78, basis: "3次提到收纳" },
  ],
};

/* ═══════════════════════════════════════════
   SCROLL NAV
   ═══════════════════════════════════════════ */
const SECTIONS = [
  { id: "p-hero", label: "总览" },
  { id: "p-behavior", label: "行为" },
  { id: "p-personality", label: "性格" },
  { id: "p-heatmap", label: "活跃" },
  { id: "p-interests", label: "兴趣" },
  { id: "p-needs", label: "需求" },
  { id: "p-preference", label: "偏好" },
  { id: "p-journey", label: "旅程" },
];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
interface Props { open: boolean; onOpenChange: (v: boolean) => void; isDesigner: boolean; name: string; }

export default function PortraitDialog({ open, onOpenChange, isDesigner, name }: Props) {
  const data = isDesigner ? DESIGNER_PORTRAIT : EC_PORTRAIT;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeNav, setActiveNav] = useState("p-hero");

  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    const handler = () => {
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = c.querySelector(`#${SECTIONS[i].id}`) as HTMLElement;
        if (el && el.offsetTop - c.scrollTop <= 64) { setActiveNav(SECTIONS[i].id); return; }
      }
      setActiveNav(SECTIONS[0].id);
    };
    c.addEventListener("scroll", handler, { passive: true });
    return () => c.removeEventListener("scroll", handler);
  }, [open]);

  const scrollTo = (id: string) => {
    const c = scrollRef.current;
    const el = c?.querySelector(`#${id}`) as HTMLElement;
    if (el && c) c.scrollTo({ top: el.offsetTop - 48, behavior: "smooth" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[880px] p-0 gap-0 overflow-hidden" style={{ maxHeight: "90vh" }}>
        <DialogHeader className="px-5 pt-4 pb-0">
          <DialogTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />{name} · 用户画像
          </DialogTitle>
        </DialogHeader>

        {/* Nav */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-5 mt-2">
          <div className="flex gap-0.5 py-1 overflow-x-auto">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${activeNav === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "calc(90vh - 90px)" }}>
          <div className="space-y-6 pt-4">

            {/* ═══ HERO ═══ */}
            <section id="p-hero">
              <div className="grid grid-cols-12 gap-4">
                {/* Persona Card */}
                <div className="col-span-3 rounded-xl border border-border/40 bg-gradient-to-br from-primary/5 to-primary/10 p-4 flex flex-col items-center text-center">
                  {/* Health ring */}
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" strokeWidth="5" className="stroke-muted/40" />
                      <circle cx="40" cy="40" r="34" fill="none" strokeWidth="5"
                        className={data.healthScore >= 70 ? "stroke-emerald-500" : data.healthScore >= 40 ? "stroke-amber-500" : "stroke-red-500"}
                        strokeLinecap="round" strokeDasharray={`${data.healthScore * 2.14} 214`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold">{data.healthScore}</span>
                      <span className="text-[8px] text-muted-foreground">健康度</span>
                    </div>
                  </div>
                  <div className="mt-2 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-[11px] font-semibold text-primary">{data.persona}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{data.personaDesc}</p>
                </div>

                {/* Radar */}
                <div className="col-span-4 rounded-xl border border-border/40 p-3">
                  <div className="w-[180px] h-[180px] mx-auto">
                    <RadarChart dimensions={data.radarDimensions} />
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 mt-1">
                    {data.radarDimensions.map(d => (
                      <div key={d.name} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[9px] text-muted-foreground">{d.name}</span>
                        <span className="text-[9px] font-bold ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics Rings */}
                <div className="col-span-5 rounded-xl border border-border/40 p-4">
                  <span className="text-[10px] font-medium text-muted-foreground">核心能力矩阵</span>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {data.radarDimensions.map((d, i) => {
                      const colors = ["primary", "emerald-500", "blue-500", "amber-500", "violet-500", "cyan-500"];
                      const c = colors[i % colors.length];
                      return (
                        <div key={d.name} className="text-center">
                          <div className="relative w-12 h-12 mx-auto">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                              <circle cx="24" cy="24" r="19" fill="none" strokeWidth="3" className="stroke-muted/30" />
                              <circle cx="24" cy="24" r="19" fill="none" strokeWidth="3"
                                className={`stroke-${c}`} strokeLinecap="round"
                                strokeDasharray={`${d.value * 1.19} 119`} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-bold">{d.value}</span>
                            </div>
                          </div>
                          <span className="text-[9px] text-muted-foreground mt-0.5 block">{d.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ BEHAVIOR TRAITS ═══ */}
            <section id="p-behavior">
              <SectionLabel title="行为特征指纹" />
              <div className="space-y-1.5 mt-3">
                {data.behaviorTraits.map((t, i) => {
                  const Icon = t.icon;
                  const barColor = t.level === "high" ? "bg-emerald-500" : t.level === "medium" ? "bg-amber-400" : "bg-muted-foreground/40";
                  return (
                    <div key={i} className="flex items-center gap-2 group">
                      <div className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center shrink-0">
                        <Icon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-[11px] font-medium w-16 shrink-0">{t.label}</span>
                      <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden relative">
                        <div className={`h-full rounded ${barColor} transition-all`} style={{ width: `${t.score}%`, opacity: 0.65 }} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">{t.evidence}</span>
                      </div>
                      <span className="text-[11px] font-bold w-7 text-right tabular-nums">{t.score}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ═══ PERSONALITY SPECTRUM ═══ */}
            <section id="p-personality">
              <SectionLabel title="性格特征谱" />
              <div className="grid grid-cols-1 gap-2 mt-3">
                {data.personalityTraits.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40">
                    <span className="text-[11px] font-medium w-14 shrink-0">{t.dimension}</span>
                    <span className="text-[9px] text-muted-foreground w-10 text-right shrink-0">{t.leftLabel}</span>
                    <div className="flex-1 h-3 bg-muted/40 rounded-full relative mx-1">
                      {/* Gradient bg */}
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-400/30 via-primary/15 to-blue-400/30" />
                      </div>
                      {/* Scale ticks */}
                      {[20, 40, 60, 80].map(m => (
                        <div key={m} className="absolute top-0 h-full w-px bg-background/50" style={{ left: `${m}%` }} />
                      ))}
                      {/* Dot */}
                      <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary shadow-md border-2 border-background"
                        style={{ left: `calc(${t.score}% - 7px)` }} />
                    </div>
                    <span className="text-[9px] text-muted-foreground w-10 shrink-0">{t.rightLabel}</span>
                    <span className="text-[10px] w-14 text-right text-muted-foreground shrink-0">{t.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ ACTIVITY HEATMAP ═══ */}
            <section id="p-heatmap">
              <SectionLabel title="活跃热力图" />
              <div className="rounded-xl border border-border/40 p-3 mt-3">
                <div className="flex gap-1">
                  <div className="flex flex-col gap-[2px] pt-4 pr-1 shrink-0">
                    {["一", "二", "三", "四", "五", "六", "日"].map(d => (
                      <div key={d} className="h-[14px] flex items-center"><span className="text-[8px] text-muted-foreground">{d}</span></div>
                    ))}
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    {/* Hour labels */}
                    <div className="flex gap-[2px] mb-[2px]">
                      {Array.from({ length: 24 }, (_, i) => (
                        <div key={i} className="flex-1 min-w-[14px] text-center">
                          <span className="text-[7px] text-muted-foreground">{i % 3 === 0 ? `${i}` : ""}</span>
                        </div>
                      ))}
                    </div>
                    {/* Grid */}
                    {data.activityHeatmap.map((row, ri) => (
                      <div key={ri} className="flex gap-[2px]">
                        {row.map((v, ci) => {
                          const max = Math.max(...data.activityHeatmap.flat());
                          const intensity = max > 0 ? v / max : 0;
                          return (
                            <div key={ci} className="flex-1 min-w-[14px] h-[14px] rounded-sm transition-colors"
                              style={{ backgroundColor: v === 0 ? "hsl(var(--muted) / 0.3)" : `hsl(var(--primary) / ${0.15 + intensity * 0.75})` }}
                              title={`周${"一二三四五六日"[ri]} ${ci}:00 — ${v}次`} />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-[8px] text-muted-foreground">少</span>
                  {[0.15, 0.3, 0.5, 0.7, 0.9].map((o, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
                  ))}
                  <span className="text-[8px] text-muted-foreground">多</span>
                </div>
              </div>
            </section>

            {/* ═══ INTEREST BUBBLES ═══ */}
            <section id="p-interests">
              <SectionLabel title="兴趣关注图谱" />
              <div className="rounded-xl border border-border/40 p-4 mt-3">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {data.interestBubbles
                    .sort((a, b) => b.weight - a.weight)
                    .map((b, i) => {
                      const size = 28 + (b.weight / 100) * 56; // 28-84px
                      return (
                        <div key={i}
                          className={`${b.color} rounded-full flex items-center justify-center text-white shrink-0 transition-transform hover:scale-110 cursor-default`}
                          style={{ width: `${size}px`, height: `${size}px`, opacity: 0.2 + (b.weight / 100) * 0.7 }}
                          title={`${b.name}: ${b.weight}%`}
                        >
                          <span className="text-[9px] font-medium text-center leading-tight px-1" style={{ fontSize: `${Math.max(8, size / 8)}px` }}>
                            {b.name}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>

            {/* ═══ NEEDS PRIORITY MATRIX ═══ */}
            <section id="p-needs">
              <SectionLabel title="需求优先级矩阵" />
              <div className="rounded-xl border border-border/40 p-4 mt-3">
                {/* Matrix grid */}
                <div className="relative h-48">
                  {/* Axes */}
                  <div className="absolute left-8 top-0 bottom-6 w-px bg-border/60" />
                  <div className="absolute left-8 bottom-6 right-0 h-px bg-border/60" />
                  <span className="absolute left-0 top-0 text-[8px] text-muted-foreground writing-mode-vertical" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>重要性 →</span>
                  <span className="absolute right-0 bottom-0 text-[8px] text-muted-foreground">紧迫性 →</span>
                  {/* Quadrant labels */}
                  <span className="absolute left-10 top-1 text-[8px] text-muted-foreground/40">重要 · 不急</span>
                  <span className="absolute right-2 top-1 text-[8px] text-muted-foreground/40">重要 · 紧急</span>
                  {/* Dots */}
                  {data.deepNeeds.map((n, i) => {
                    const Icon = n.icon;
                    const urgencyX = n.urgency === "urgent" ? 85 : n.urgency === "normal" ? 50 : 20;
                    const importanceY = 100 - n.importance;
                    const dotColors = { urgent: "bg-red-500 border-red-200", normal: "bg-blue-500 border-blue-200", latent: "bg-muted-foreground/60 border-muted" };
                    return (
                      <div key={i} className="absolute group" style={{ left: `calc(${urgencyX}% + 8px)`, top: `${importanceY * 0.42}%` }}>
                        <div className={`w-10 h-10 rounded-full ${dotColors[n.urgency]} border-2 flex items-center justify-center shadow-sm cursor-default transition-transform hover:scale-125`}
                          style={{ opacity: 0.3 + (n.importance / 100) * 0.6 }}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                          <div className="bg-popover border border-border rounded-lg shadow-md px-2.5 py-1.5 whitespace-nowrap">
                            <div className="text-[10px] font-medium">{n.need}</div>
                            <div className="text-[9px] text-muted-foreground">{n.basis} → {n.suggestion}</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-medium mt-0.5 block text-center">{n.category}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ═══ PREFERENCE ═══ */}
            <section id="p-preference">
              <SectionLabel title="偏好置信度" />
              <div className="grid grid-cols-5 gap-2 mt-3">
                {data.designPreferences.map((p, i) => (
                  <div key={i} className="rounded-xl border border-border/40 p-3 text-center">
                    {/* Confidence ring */}
                    <div className="relative w-12 h-12 mx-auto">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="19" fill="none" strokeWidth="3.5" className="stroke-muted/30" />
                        <circle cx="24" cy="24" r="19" fill="none" strokeWidth="3.5"
                          className={p.confidence >= 85 ? "stroke-emerald-500" : p.confidence >= 70 ? "stroke-primary" : "stroke-amber-500"}
                          strokeLinecap="round" strokeDasharray={`${p.confidence * 1.19} 119`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold">{p.confidence}</span>
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <div className="text-[9px] text-muted-foreground">{p.dimension}</div>
                      <div className="text-[11px] font-medium mt-0.5">{p.preference}</div>
                    </div>
                    <div className="text-[8px] text-muted-foreground mt-1">{p.basis}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ JOURNEY ═══ */}
            <section id="p-journey">
              <SectionLabel title="客户旅程" />
              <div className="rounded-xl border border-border/40 p-4 mt-3">
                <div className="flex items-center">
                  {data.journeyStages.map((s, i) => {
                    const done = s.status === "done";
                    const current = s.status === "current";
                    return (
                      <div key={i} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                            done ? "bg-emerald-500 border-emerald-400 text-white" :
                            current ? "bg-primary border-primary text-primary-foreground animate-pulse" :
                            "bg-muted border-border text-muted-foreground"
                          }`}>
                            {done ? "✓" : current ? i + 1 : i + 1}
                          </div>
                          <span className={`text-[10px] font-medium mt-1 ${current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</span>
                          <span className="text-[9px] text-muted-foreground">{s.metric}</span>
                        </div>
                        {i < data.journeyStages.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-0.5 rounded ${done ? "bg-emerald-500" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════
   SUB COMPONENTS
   ═══════════════════════════════════════════ */

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 rounded-full bg-primary" />
      <span className="text-xs font-semibold">{title}</span>
    </div>
  );
}

function RadarChart({ dimensions }: { dimensions: { name: string; value: number }[] }) {
  const n = dimensions.length;
  const cx = 70, cy = 70, r = 55;
  const pt = (i: number, val: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + (r * val / 100) * Math.cos(a), y: cy + (r * val / 100) * Math.sin(a) };
  };
  return (
    <svg viewBox="0 0 140 140" className="w-full h-full">
      {/* Grid rings */}
      {[25, 50, 75, 100].map(l => (
        <polygon key={l}
          points={Array.from({ length: n }, (_, i) => { const p = pt(i, l); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" className="stroke-border/25" strokeWidth="0.5" />
      ))}
      {/* Axis lines */}
      {dimensions.map((_, i) => { const p = pt(i, 100); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="stroke-border/15" strokeWidth="0.5" />; })}
      {/* Fill area */}
      <polygon
        points={dimensions.map((dd, i) => { const p = pt(i, dd.value); return `${p.x},${p.y}`; }).join(" ")}
        className="fill-primary/12 stroke-primary" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Data dots */}
      {dimensions.map((dd, i) => {
        const p = pt(i, dd.value);
        return <circle key={`d${i}`} cx={p.x} cy={p.y} r="3" className="fill-primary stroke-background" strokeWidth="1.5" />;
      })}
      {/* Labels */}
      {dimensions.map((dd, i) => {
        const p = pt(i, 120);
        return <text key={`t${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[7px] font-medium">{dd.name}</text>;
      })}
    </svg>
  );
}
