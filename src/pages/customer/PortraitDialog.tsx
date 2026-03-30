import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Brain, Activity, Heart, Target, Lightbulb, TrendingUp,
  Zap, Eye, Shield, Users, Sparkles, Star, Clock, BarChart3,
} from "lucide-react";

/* ═══ Types ═══ */
export interface BehaviorTrait {
  label: string;
  level: "high" | "medium" | "low";
  score: number; // 0-100 for bar
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
}

/* ═══ Mock Data — Designer ═══ */
export const DESIGNER_PORTRAIT: PortraitData = {
  behaviorSummary: "高频创作驱动型用户，工作时间集中在工作日下午，偏好AI辅助快速出图，对新功能接受度高但深度使用有限。",
  personalitySummary: "理性务实的效率主义者，注重投入产出比，对品质有要求但不愿为「锦上添花」付费，社交意愿中等。",
  needsSummary: "核心诉求是提升出图效率和客户成交率，潜在需求是专业品牌建设和被动获客能力。",
  radarDimensions: [
    { name: "创作活跃", value: 82 }, { name: "工具深度", value: 65 },
    { name: "付费意愿", value: 78 }, { name: "分享传播", value: 45 },
    { name: "学习成长", value: 70 }, { name: "客户服务", value: 58 },
  ],
  behaviorTraits: [
    { label: "高频创作者", level: "high", score: 92, evidence: "月均设计42套 Top 8%，日均AI调用9.3次", icon: Zap },
    { label: "效率优先型", level: "high", score: 88, evidence: "单方案耗时从4.2h→1.8h，依赖AI+微调", icon: Activity },
    { label: "渲染质量敏感", level: "medium", score: 65, evidence: "3D渲染71% · 4K仅16%，频繁对比分辨率", icon: Eye },
    { label: "功能探索", level: "medium", score: 58, evidence: "使用6/8核心功能，VR仅体验性使用", icon: Lightbulb },
    { label: "社交传播", level: "low", score: 35, evidence: "公开分享3次/月，但私域推荐转化率67%", icon: Users },
    { label: "学习意愿", level: "medium", score: 70, evidence: "教程完成率78%，新功能72h内尝试", icon: Brain },
  ],
  personalityTraits: [
    { dimension: "决策风格", score: 75, leftLabel: "感性", rightLabel: "理性", desc: "使用率>70%才触发购买，数据驱动型" },
    { dimension: "价格敏感度", score: 40, leftLabel: "高", rightLabel: "低", desc: "年付折扣偏好，有感知但不影响核心决策" },
    { dimension: "社交倾向", score: 45, leftLabel: "内向", rightLabel: "外向", desc: "私下推荐为主，适合KOC型运营" },
    { dimension: "风险偏好", score: 60, leftLabel: "保守", rightLabel: "进取", desc: "新功能先测试方案验证再用于正式项目" },
    { dimension: "品牌忠诚", score: 72, leftLabel: "低", rightLabel: "高", desc: "连续2次续费+升级，竞品使用极低" },
  ],
  deepNeeds: [
    { category: "效率", need: "缩短从接单到出图全流程时间", urgency: "urgent", basis: "项目周期14→8天，近期频繁批量渲染", suggestion: "开通「智能方案模板」自动生成初稿", icon: Zap },
    { category: "获客", need: "建立个人品牌，实现被动获客", urgency: "normal", basis: "推荐均来自口碑，从未展示作品", suggestion: "引导设计师主页+作品集展示", icon: Target },
    { category: "品质", need: "提升交付物专业度", urgency: "normal", basis: "PDF导出56次但4K渲染仅8次", suggestion: "赠5次4K体验+对比案例", icon: Star },
    { category: "成长", need: "拓展设计风格范围", urgency: "latent", basis: "现代简约78%，市场新中式需求35%", suggestion: "推新中式AI模板包+培训", icon: TrendingUp },
  ],
  designPreferences: [
    { dimension: "设计风格", preference: "现代简约 (78%)", confidence: 95, basis: "42套中33套为现代简约" },
    { dimension: "色彩倾向", preference: "低饱和暖色调", confidence: 82, basis: "白橡木、暖灰、米色占67%" },
    { dimension: "空间类型", preference: "住宅全屋", confidence: 90, basis: "客厅38 > 厨房28 > 卧室22" },
    { dimension: "材质偏好", preference: "实木+石材+金属", confidence: 75, basis: "木质52%、大理石18%" },
    { dimension: "渲染偏好", preference: "自然光·45°俯角", confidence: 88, basis: "自然光79%，45°±10°占65%" },
  ],
};

/* ═══ Mock Data — End Customer ═══ */
export const EC_PORTRAIT: PortraitData = {
  behaviorSummary: "决策周期87天的高净值客户，重视设计效果的直观感受，倾向于多方比较后集中决策。",
  personalitySummary: "注重细节的品质追求者，对居住体验有明确标准，信任专业建议但需要视觉化验证。",
  needsSummary: "核心诉求是获得「省心且高品质」的一站式装修体验，潜在需求是软装搭配和智能家居。",
  radarDimensions: [
    { name: "意向度", value: 92 }, { name: "满意度", value: 88 },
    { name: "合作深度", value: 75 }, { name: "转介绍", value: 60 },
    { name: "预算力", value: 85 }, { name: "配合度", value: 78 },
  ],
  behaviorTraits: [
    { label: "视觉决策型", level: "high", score: 90, evidence: "80%反馈围绕效果图，数据参数关注度低", icon: Eye },
    { label: "多方比较者", level: "high", score: 85, evidence: "关联2家企业，3个平台搜索比价", icon: Users },
    { label: "品质导向", level: "high", score: 88, evidence: "均价1250/㎡高于区域35%，关注环保", icon: Star },
    { label: "沟通稳定", level: "medium", score: 65, evidence: "每周1次，工作日晚20:00-21:30", icon: Clock },
    { label: "决策需推动", level: "medium", score: 55, evidence: "方案确认耗时22天，3次修改细节", icon: Shield },
  ],
  personalityTraits: [
    { dimension: "决策风格", score: 35, leftLabel: "感性", rightLabel: "理性", desc: "看重视觉效果和居住想象" },
    { dimension: "价格敏感度", score: 30, leftLabel: "高", rightLabel: "低", desc: "高品质追加费用接受度高" },
    { dimension: "参与意愿", score: 80, leftLabel: "低", rightLabel: "高", desc: "每套方案都提出修改意见" },
    { dimension: "信任建立", score: 65, leftLabel: "慢", rightLabel: "快", desc: "第3次沟通后建立初步信任" },
    { dimension: "传播意愿", score: 55, leftLabel: "低", rightLabel: "高", desc: "满意度高但未主动分享" },
  ],
  deepNeeds: [
    { category: "品质", need: "一站式高品质全屋定制", urgency: "urgent", basis: "全品类合同+预算充足", suggestion: "推荐一站式管家服务", icon: Shield },
    { category: "体验", need: "施工过程透明可视化", urgency: "normal", basis: "3次询问进度，要求拍照", suggestion: "开通工地直播+进度推送", icon: Eye },
    { category: "延伸", need: "软装搭配与智能家居", urgency: "latent", basis: "2次提到软装，有5岁孩子", suggestion: "完工70%时推软装+安全方案", icon: Heart },
  ],
  designPreferences: [
    { dimension: "整体风格", preference: "现代简约·留白感", confidence: 90, basis: "3次评审均选简洁方案" },
    { dimension: "色调偏好", preference: "奶油白+原木+灰调", confidence: 85, basis: "参考图90%为暖白调" },
    { dimension: "功能诉求", preference: "收纳>美观>智能", confidence: 78, basis: "3次提到收纳，U型厨房" },
  ],
};

/* ═══ Scroll Nav Sections ═══ */
const SECTIONS = [
  { id: "p-overview", label: "总览", icon: Brain },
  { id: "p-behavior", label: "行为", icon: Activity },
  { id: "p-personality", label: "性格", icon: Heart },
  { id: "p-needs", label: "需求", icon: Target },
  { id: "p-preference", label: "偏好", icon: Sparkles },
];

/* ═══ Component ═══ */
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDesigner: boolean;
  name: string;
}

export default function PortraitDialog({ open, onOpenChange, isDesigner, name }: Props) {
  const data = isDesigner ? DESIGNER_PORTRAIT : EC_PORTRAIT;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeNav, setActiveNav] = useState("p-overview");

  // scroll spy within dialog
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handler = () => {
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = container.querySelector(`#${SECTIONS[i].id}`) as HTMLElement;
        if (el && el.offsetTop - container.scrollTop <= 60) {
          setActiveNav(SECTIONS[i].id);
          return;
        }
      }
      setActiveNav(SECTIONS[0].id);
    };
    container.addEventListener("scroll", handler, { passive: true });
    return () => container.removeEventListener("scroll", handler);
  }, [open]);

  const scrollToSection = (id: string) => {
    const container = scrollRef.current;
    const el = container?.querySelector(`#${id}`) as HTMLElement;
    if (el && container) {
      container.scrollTo({ top: el.offsetTop - 48, behavior: "smooth" });
    }
  };

  const levelColors = { high: "bg-emerald-500", medium: "bg-amber-400", low: "bg-muted-foreground/40" };
  const urgencyColors = { urgent: "from-red-500 to-red-400", normal: "from-blue-500 to-blue-400", latent: "from-muted-foreground/50 to-muted-foreground/30" };
  const urgencyLabels = { urgent: "迫切", normal: "常规", latent: "潜在" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="px-5 pt-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4 text-primary" />
            {name} · 完整用户画像
          </DialogTitle>
        </DialogHeader>

        {/* Mini Nav */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-5 mt-2">
          <div className="flex items-center gap-0.5 py-1.5 overflow-x-auto">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => scrollToSection(s.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                  activeNav === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <s.icon className="h-3 w-3" />{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef} className="overflow-y-auto px-5 pb-5 space-y-6" style={{ maxHeight: "calc(90vh - 100px)" }}>

          {/* ═══ OVERVIEW ═══ */}
          <section id="p-overview" className="pt-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Radar */}
              <div className="col-span-5">
                <div className="rounded-xl border border-border/40 p-4 bg-muted/20">
                  <div className="w-[180px] h-[180px] mx-auto">
                    <RadarChart dimensions={data.radarDimensions} />
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {data.radarDimensions.map(d => (
                      <div key={d.name} className="text-center">
                        <div className={`text-xs font-bold ${d.value >= 80 ? "text-primary" : d.value >= 60 ? "text-foreground" : "text-muted-foreground"}`}>{d.value}</div>
                        <div className="text-[9px] text-muted-foreground">{d.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Summary Cards */}
              <div className="col-span-7 space-y-3">
                <SummaryBanner icon={Activity} color="blue" label="行为特征" text={data.behaviorSummary} />
                <SummaryBanner icon={Heart} color="violet" label="性格画像" text={data.personalitySummary} />
                <SummaryBanner icon={Target} color="emerald" label="核心需求" text={data.needsSummary} />
                {/* Quick trait badges */}
                <div className="flex flex-wrap gap-1.5">
                  {data.behaviorTraits.filter(t => t.level === "high").map((t, i) => {
                    const Icon = t.icon;
                    return (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Icon className="h-3 w-3" />{t.label}
                      </span>
                    );
                  })}
                  {data.behaviorTraits.filter(t => t.level === "medium").map((t, i) => {
                    const Icon = t.icon;
                    return (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <Icon className="h-3 w-3" />{t.label}
                      </span>
                    );
                  })}
                  {data.behaviorTraits.filter(t => t.level === "low").map((t, i) => {
                    const Icon = t.icon;
                    return (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/40">
                        <Icon className="h-3 w-3" />{t.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ BEHAVIOR ═══ */}
          <section id="p-behavior">
            <SectionLabel icon={Activity} title="行为特征分析" />
            <div className="space-y-2 mt-3">
              {data.behaviorTraits.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="w-20 shrink-0">
                      <span className="text-xs font-medium">{t.label}</span>
                    </div>
                    {/* Visual bar */}
                    <div className="flex-1 h-6 bg-muted/40 rounded-lg overflow-hidden relative">
                      <div className={`h-full rounded-lg ${levelColors[t.level]} transition-all`} style={{ width: `${t.score}%`, opacity: 0.7 }} />
                      <span className="absolute inset-0 flex items-center px-2 text-[10px] text-foreground/80 font-medium">{t.evidence}</span>
                    </div>
                    <span className="text-xs font-bold w-8 text-right">{t.score}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══ PERSONALITY ═══ */}
          <section id="p-personality">
            <SectionLabel icon={Heart} title="性格特征谱" />
            <div className="grid grid-cols-1 gap-3 mt-3">
              {data.personalityTraits.map((t, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium">{t.dimension}</span>
                    <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-8 text-right shrink-0">{t.leftLabel}</span>
                    <div className="flex-1 h-3 bg-muted rounded-full relative">
                      {/* gradient track */}
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-violet-300/50 via-primary/20 to-blue-300/50" />
                      </div>
                      {/* dot */}
                      <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-md border-2 border-background transition-all"
                        style={{ left: `calc(${t.score}% - 8px)` }} />
                      {/* scale marks */}
                      {[0, 25, 50, 75, 100].map(m => (
                        <div key={m} className="absolute top-0 h-full w-px bg-background/60" style={{ left: `${m}%` }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8 shrink-0">{t.rightLabel}</span>
                    <span className="text-xs font-bold w-6 text-right text-primary">{t.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ DEEP NEEDS ═══ */}
          <section id="p-needs">
            <SectionLabel icon={Target} title="深层需求图谱" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
              {data.deepNeeds.map((n, i) => {
                const Icon = n.icon;
                return (
                  <div key={i} className="rounded-xl border border-border/40 overflow-hidden">
                    {/* urgency color bar on top */}
                    <div className={`h-1 bg-gradient-to-r ${urgencyColors[n.urgency]}`} />
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold">{n.need}</span>
                            <span className={`px-1 py-0.5 rounded text-[9px] font-medium bg-gradient-to-r ${urgencyColors[n.urgency]} text-white`}>{urgencyLabels[n.urgency]}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{n.category}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{n.basis}</p>
                      <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                        <Lightbulb className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-emerald-700">{n.suggestion}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══ PREFERENCES ═══ */}
          <section id="p-preference">
            <SectionLabel icon={Sparkles} title="偏好洞察" />
            <div className="space-y-2 mt-3">
              {data.designPreferences.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40">
                  <div className="w-16 shrink-0">
                    <span className="text-[10px] text-muted-foreground">{p.dimension}</span>
                  </div>
                  <span className="text-xs font-medium flex-1">{p.preference}</span>
                  {/* confidence ring */}
                  <div className="relative w-9 h-9 shrink-0">
                    <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3" className="stroke-muted" />
                      <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                        className={p.confidence >= 85 ? "stroke-emerald-500" : "stroke-amber-500"}
                        strokeLinecap="round" strokeDasharray={`${p.confidence * 0.88} 88`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-bold">{p.confidence}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-24 shrink-0 truncate">{p.basis}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══ Sub Components ═══ */

function SectionLabel({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 rounded-full bg-primary" />
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="text-xs font-semibold">{title}</span>
    </div>
  );
}

function SummaryBanner({ icon: Icon, color, label, text }: { icon: React.ElementType; color: string; label: string; text: string }) {
  const iconColors: Record<string, string> = { blue: "bg-blue-100 text-blue-600", violet: "bg-violet-100 text-violet-600", emerald: "bg-emerald-100 text-emerald-600" };
  const borderColors: Record<string, string> = { blue: "border-blue-100", violet: "border-violet-100", emerald: "border-emerald-100" };
  return (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${borderColors[color]} bg-card`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconColors[color]}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
        <p className="text-xs leading-relaxed mt-0.5">{text}</p>
      </div>
    </div>
  );
}

function RadarChart({ dimensions }: { dimensions: { name: string; value: number }[] }) {
  const n = dimensions.length;
  const cx = 70, cy = 70, r = 52;
  const pt = (i: number, val: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + (r * val / 100) * Math.cos(a), y: cy + (r * val / 100) * Math.sin(a) };
  };
  return (
    <svg viewBox="0 0 140 140" className="w-full h-full">
      {[25, 50, 75, 100].map(l => (
        <polygon key={l} points={Array.from({ length: n }, (_, i) => { const p = pt(i, l); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" className="stroke-border/30" strokeWidth="0.5" />
      ))}
      {dimensions.map((_, i) => { const p = pt(i, 100); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="stroke-border/20" strokeWidth="0.5" />; })}
      <polygon points={dimensions.map((dd, i) => { const p = pt(i, dd.value); return `${p.x},${p.y}`; }).join(" ")} className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      {dimensions.map((dd, i) => { const p = pt(i, dd.value); return <circle key={`d${i}`} cx={p.x} cy={p.y} r="2.5" className="fill-primary" />; })}
      {dimensions.map((dd, i) => { const p = pt(i, 125); return <text key={`t${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[7px]">{dd.name}</text>; })}
    </svg>
  );
}
