import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, Box, TrendingUp, Users, Clock } from "lucide-react";

const stats = [
  { label: "核心模块", value: "12+", icon: Box, color: "text-primary" },
  { label: "设计原则", value: "11", icon: Shield, color: "text-accent" },
  { label: "企业类型", value: "7", icon: Building2, color: "text-warning" },
  { label: "产品线", value: "5", icon: TrendingUp, color: "text-primary" },
];

const milestones = [
  { phase: "短期 (0-6月)", goal: "脱淘验证", desc: "国内版完全脱离淘宝账号体系，智能导购全链路走通", status: "progress" },
  { phase: "中期 (6-12月)", goal: "产品接入", desc: "国内3D、国际3D、精准营销等产品接入新架构", status: "todo" },
  { phase: "长期 (12-24月)", goal: "AI化演进", desc: "AI辅助设计、智能推荐、平台化演进", status: "todo" },
];

const painPoints = [
  { title: "账号体系依赖", desc: "国内版账号依赖淘宝体系，阿里一旦叫停核心资产将瘫痪", severity: "high" },
  { title: "系统架构混乱", desc: "近十年迭代历史债务严重，已丧失对系统的监控权", severity: "high" },
  { title: "系统分散重复", desc: "国内外两套系统，很多模块重复开发，资源浪费严重", severity: "medium" },
  { title: "数据资产混乱", desc: "跨企业、跨平台的数据流不可控", severity: "medium" },
];

export default function Index() {
  return (
    <div className="doc-prose">
      <PageHeader
        title="项目概览"
        description="脱淘项目 — 从底层重新设计架构，建立可支撑3-5年演进的稳定系统"
        badge="顶层架构设计"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Background */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            公司背景
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono shrink-0">2016</span>
              <span>居然之家斥资1亿美金收购 AUTODESK Homestyler，中文命名"居然设计家"</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono shrink-0">2019</span>
              <span>阿里巴巴增资和收购，取得控制权</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono shrink-0">2023</span>
              <span>居然之家增资重新获得控制权，定位转向设计AI</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono shrink-0">2025</span>
              <span className="text-foreground font-medium">启动脱淘项目 & 国内外统一</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pain Points */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-destructive" />
        当前痛点
      </h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {painPoints.map((p) => (
          <Card key={p.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`status-badge ${p.severity === "high" ? "status-risk-high" : "status-risk-medium"}`}>
                  {p.severity === "high" ? "高风险" : "中风险"}
                </span>
                <span className="font-medium text-foreground text-sm">{p.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Milestones */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        战略目标
      </h2>
      <div className="space-y-4 mb-8">
        {milestones.map((m) => (
          <Card key={m.phase}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className="shrink-0 w-32">
                <span className={`status-badge ${m.status === "progress" ? "status-progress" : "status-todo"}`}>
                  {m.phase}
                </span>
              </div>
              <div>
                <div className="font-medium text-foreground">{m.goal}</div>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Metrics */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-accent" />
        成功标准
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">业务指标</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">用户迁移率</span><span className="font-mono text-foreground">≥ 95%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">业务零中断</span><span className="font-mono text-foreground">≥ 99.9%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">企业客户增长</span><span className="font-mono text-foreground">50%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">客单价提升</span><span className="font-mono text-foreground">30%</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">技术指标</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">系统可用性</span><span className="font-mono text-foreground">≥ 99.9%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">响应时间 P95</span><span className="font-mono text-foreground">&lt; 500ms</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">数据准确性</span><span className="font-mono text-foreground">100%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">架构稳定性</span><span className="font-mono text-foreground">3-5年</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
