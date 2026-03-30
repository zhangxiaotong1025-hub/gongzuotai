import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Activity, Heart, Target, Lightbulb, TrendingUp,
  Zap, Eye, Shield, Users, Sparkles, Star, Clock, BarChart3,
} from "lucide-react";

/* ═══ Types ═══ */
export interface BehaviorTrait {
  label: string;
  level: "high" | "medium" | "low";
  evidence: string;
  icon: React.ElementType;
}

export interface PersonalityTrait {
  dimension: string;
  score: number;        // 0-100
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
    { label: "高频创作者", level: "high", evidence: "月均设计42套，Top 8%；日均AI调用9.3次，连续22天活跃", icon: Zap },
    { label: "效率优先型", level: "high", evidence: "平均单方案耗时从4.2h降至1.8h；高度依赖AI生成+快速微调模式", icon: Activity },
    { label: "渲染质量敏感", level: "medium", evidence: "3D渲染使用率71%但4K仅16%；多次在渲染设置中切换分辨率对比", icon: Eye },
    { label: "功能探索意愿中等", level: "medium", evidence: "使用6/8项核心功能；VR全景仅体验性使用(12次/30配额)", icon: Lightbulb },
    { label: "社交分享较弱", level: "low", evidence: "分享方案至社交平台仅3次/月；但推荐转化率67%说明私域影响力强", icon: Users },
    { label: "学习型用户", level: "medium", evidence: "教程视频观看完成率78%；新功能上线72h内必尝试", icon: Brain },
  ],
  personalityTraits: [
    { dimension: "决策风格", score: 75, leftLabel: "感性", rightLabel: "理性", desc: "从升级历史看，均在使用率>70%后才触发购买，属于数据驱动型决策" },
    { dimension: "价格敏感度", score: 40, leftLabel: "高", rightLabel: "低", desc: "ARPU ¥775/月，2次续费均选年付享折扣，对价格有感知但不影响核心决策" },
    { dimension: "社交倾向", score: 45, leftLabel: "内向", rightLabel: "外向", desc: "推荐3人但均为私下推荐非公开分享，适合KOC而非KOL型运营" },
    { dimension: "风险偏好", score: 60, leftLabel: "保守", rightLabel: "进取", desc: "新功能上线72h内尝试，但不会立即用于正式项目，先在测试方案中验证" },
    { dimension: "品牌忠诚", score: 72, leftLabel: "低", rightLabel: "高", desc: "连续2次续费+2次升级，使用竞品频率极低(监测到仅2次外链跳转)" },
  ],
  deepNeeds: [
    { category: "效率", need: "进一步缩短从接单到出图的全流程时间", urgency: "urgent", basis: "平均项目周期从14天压缩到8天，但仍在寻求优化——近期频繁使用批量渲染", suggestion: "开通「智能方案模板」，可基于户型自动生成3套方案初稿", icon: Zap },
    { category: "获客", need: "建立个人设计师品牌，实现被动获客", urgency: "normal", basis: "3次推荐均来自老客户口碑，但从未主动在平台展示作品或参与设计师社区", suggestion: "引导开通设计师主页+作品集展示，接入平台获客流量", icon: Target },
    { category: "品质", need: "提升交付物的专业度和客户感知价值", urgency: "normal", basis: "方案导出PDF使用率高(56次)，但4K渲染仅8次；说明重视交付但未意识到高清渲染的客户说服力", suggestion: "赠送5次4K体验额度+对比案例，让用户感知画质对成交的影响", icon: Star },
    { category: "成长", need: "拓展设计风格范围以承接更多客户类型", urgency: "latent", basis: "设计风格集中在现代简约(78%)，其他风格仅占22%；但市场需求中新中式占35%", suggestion: "推送新中式风格AI模板包+培训课程", icon: TrendingUp },
  ],
  designPreferences: [
    { dimension: "设计风格", preference: "现代简约 (78%)", confidence: 95, basis: "42套方案中33套为现代简约，AI风格选择记录" },
    { dimension: "色彩倾向", preference: "低饱和暖色调", confidence: 82, basis: "材质选择偏好白橡木、暖灰色系、米色占67%" },
    { dimension: "空间类型", preference: "住宅全屋 (客厅>厨房>卧室)", confidence: 90, basis: "空间设计频次排序：客厅38次、厨房28次、卧室22次" },
    { dimension: "材质偏好", preference: "实木+石材+金属点缀", confidence: 75, basis: "模型下载分类中木质家具占52%、大理石占18%" },
    { dimension: "渲染偏好", preference: "日光自然光 · 45°俯角", confidence: 88, basis: "渲染参数设置中自然光占79%，相机角度45°±10°占65%" },
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
    { label: "视觉决策型", level: "high", evidence: "方案评审中80%反馈围绕「效果图是否好看」，对数据参数关注度低", icon: Eye },
    { label: "多方比较者", level: "high", evidence: "同时关联2家企业，首次到店前已在3个平台搜索比价", icon: Users },
    { label: "品质导向", level: "high", evidence: "预算15万(120㎡均价1250/㎡)高于区域均值35%；主动询问材质环保等级", icon: Star },
    { label: "沟通频率稳定", level: "medium", evidence: "平均每周1次主动联系设计师，集中在工作日晚间20:00-21:30", icon: Clock },
    { label: "决策需推动", level: "medium", evidence: "方案B确认耗时22天，期间3次要求修改细节但核心方案未变", icon: Shield },
  ],
  personalityTraits: [
    { dimension: "决策风格", score: 35, leftLabel: "感性", rightLabel: "理性", desc: "更看重视觉效果和居住想象，而非价格对比表格，属于「看感觉」型决策" },
    { dimension: "价格敏感度", score: 30, leftLabel: "高", rightLabel: "低", desc: "预算高于区域均值35%，对高品质材料追加费用接受度高" },
    { dimension: "参与意愿", score: 80, leftLabel: "低", rightLabel: "高", desc: "每套方案都提出修改意见，会主动搜集案例图片发给设计师参考" },
    { dimension: "信任建立", score: 65, leftLabel: "慢", rightLabel: "快", desc: "首次到店后即要求看设计师过往案例，第3次沟通后建立初步信任" },
    { dimension: "传播意愿", score: 55, leftLabel: "低", rightLabel: "高", desc: "满意度88分但未主动分享，需通过激励机制引导推荐" },
  ],
  deepNeeds: [
    { category: "品质", need: "一站式高品质全屋定制体验", urgency: "urgent", basis: "合同包含橱柜、衣柜、书柜全品类，且预算充足，不希望分头对接多个品牌", suggestion: "推荐「全屋定制一站式管家服务」，指定专属客服跟进全流程", icon: Shield },
    { category: "体验", need: "施工过程的透明可视化", urgency: "normal", basis: "已3次询问施工进度，曾要求设计师拍摄现场照片", suggestion: "开通「工地直播」和「进度推送」，每周自动发送图文进度报告", icon: Eye },
    { category: "延伸", need: "软装搭配与智能家居集成", urgency: "latent", basis: "方案评审时2次提到「软装也想一起做」，家庭有5岁孩子(安全需求)", suggestion: "在硬装完成70%时推荐软装方案+儿童安全家居方案", icon: Heart },
  ],
  designPreferences: [
    { dimension: "整体风格", preference: "现代简约 · 留白感", confidence: 90, basis: "3次方案评审均选择简洁方案，拒绝繁复欧式" },
    { dimension: "色调偏好", preference: "奶油白+原木色+灰调", confidence: 85, basis: "主动发送的参考图90%为暖白调，反复强调'温馨但不杂'" },
    { dimension: "功能诉求", preference: "收纳>美观>智能", confidence: 78, basis: "有5岁孩子，3次提到收纳需求，厨房要求U型最大化台面" },
  ],
};

/* ═══ Component ═══ */
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDesigner: boolean;
  name: string;
}

export default function PortraitDialog({ open, onOpenChange, isDesigner, name }: Props) {
  const data = isDesigner ? DESIGNER_PORTRAIT : EC_PORTRAIT;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            {name} · 完整用户画像
          </DialogTitle>
        </DialogHeader>

        {/* Radar + Summary Header */}
        <div className="grid grid-cols-12 gap-4 mt-2">
          <div className="col-span-4">
            <div className="w-full aspect-square max-w-[180px] mx-auto">
              <RadarChart dimensions={data.radarDimensions} />
            </div>
          </div>
          <div className="col-span-8 space-y-2">
            <SummaryCard icon={Activity} title="行为摘要" text={data.behaviorSummary} color="blue" />
            <SummaryCard icon={Heart} title="性格摘要" text={data.personalitySummary} color="violet" />
            <SummaryCard icon={Target} title="需求摘要" text={data.needsSummary} color="emerald" />
          </div>
        </div>

        <Tabs defaultValue="behavior" className="mt-4">
          <TabsList className="w-full grid grid-cols-4 h-8">
            <TabsTrigger value="behavior" className="text-xs gap-1"><Activity className="h-3 w-3" />行为特征</TabsTrigger>
            <TabsTrigger value="personality" className="text-xs gap-1"><Heart className="h-3 w-3" />性格特征</TabsTrigger>
            <TabsTrigger value="needs" className="text-xs gap-1"><Target className="h-3 w-3" />深层需求</TabsTrigger>
            <TabsTrigger value="preference" className="text-xs gap-1"><Sparkles className="h-3 w-3" />偏好洞察</TabsTrigger>
          </TabsList>

          {/* ── 行为特征 ── */}
          <TabsContent value="behavior" className="mt-3 space-y-2">
            {data.behaviorTraits.map((t, i) => {
              const levelMap = { high: { l: "显著", c: "bg-emerald-100 text-emerald-700" }, medium: { l: "中等", c: "bg-amber-100 text-amber-700" }, low: { l: "较弱", c: "bg-muted text-muted-foreground" } };
              const lv = levelMap[t.level];
              const Icon = t.icon;
              return (
                <div key={i} className="p-3 rounded-lg border border-border/40 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">{t.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${lv.c}`}>{lv.l}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 ml-9 leading-relaxed">{t.evidence}</p>
                </div>
              );
            })}
          </TabsContent>

          {/* ── 性格特征 ── */}
          <TabsContent value="personality" className="mt-3 space-y-3">
            {data.personalityTraits.map((t, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t.dimension}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0">{t.leftLabel}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-200 via-primary/30 to-blue-200 rounded-full" />
                    <div className="absolute top-0 h-full w-3 bg-primary rounded-full shadow-sm transition-all" style={{ left: `calc(${t.score}% - 6px)` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-10 shrink-0">{t.rightLabel}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </TabsContent>

          {/* ── 深层需求 ── */}
          <TabsContent value="needs" className="mt-3 space-y-2">
            {data.deepNeeds.map((n, i) => {
              const uMap = { urgent: { l: "迫切", c: "bg-red-100 text-red-700" }, normal: { l: "常规", c: "bg-blue-100 text-blue-700" }, latent: { l: "潜在", c: "bg-muted text-muted-foreground" } };
              const u = uMap[n.urgency];
              const Icon = n.icon;
              return (
                <div key={i} className="p-3 rounded-lg border border-border/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{n.category}</span>
                    <span className="text-sm font-medium flex-1">{n.need}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${u.c}`}>{u.l}</span>
                  </div>
                  <div className="ml-9 space-y-1.5">
                    <div className="flex items-start gap-1">
                      <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">依据</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{n.basis}</p>
                    </div>
                    <div className="flex items-start gap-1 p-2 rounded bg-emerald-50/50 border border-emerald-100">
                      <Lightbulb className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-emerald-700 leading-relaxed">{n.suggestion}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* ── 偏好洞察 ── */}
          <TabsContent value="preference" className="mt-3 space-y-2">
            {data.designPreferences.map((p, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{p.dimension}</span>
                    <span className="text-sm font-medium">{p.preference}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">置信度</span>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.confidence >= 85 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${p.confidence}%` }} />
                    </div>
                    <span className="text-[10px] font-medium">{p.confidence}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{p.basis}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* ═══ Sub Components ═══ */

function SummaryCard({ icon: Icon, title, text, color }: { icon: React.ElementType; title: string; text: string; color: string }) {
  const colors: Record<string, string> = { blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", emerald: "bg-emerald-50 text-emerald-600" };
  const iconColor = colors[color] || colors.blue;
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg border border-border/40">
      <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className="h-3 w-3" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-medium text-muted-foreground">{title}</span>
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
      {dimensions.map((dd, i) => { const p = pt(i, dd.value); return <circle key={`d${i}`} cx={p.x} cy={p.y} r="2" className="fill-primary" />; })}
      {dimensions.map((dd, i) => { const p = pt(i, 125); return <text key={`t${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[7px]">{dd.name}</text>; })}
    </svg>
  );
}
