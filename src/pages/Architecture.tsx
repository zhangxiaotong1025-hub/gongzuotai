import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const layers = [
  { level: 7, name: "应用端产品层", desc: "多产品矩阵（产品是权限第一维度）", items: ["国内3D", "国际3D", "智能导购", "精准营销", "AI设计家App"], color: "bg-primary/10 border-primary/20" },
  { level: 6, name: "后台管理层", desc: "统一后台管理系统", items: ["企业管理", "权限管理", "资产管理", "权益管理", "品牌管理", "营销管理"], color: "bg-accent/10 border-accent/20" },
  { level: 5, name: "权限控制层", desc: "统一的权限引擎", items: ["产品权限", "菜单权限", "数据权限", "操作权限"], color: "bg-warning/10 border-warning/20" },
  { level: 4, name: "业务逻辑层", desc: "核心业务逻辑", items: ["企业管理", "用户管理", "资产管理", "授权管理", "权益管理"], color: "bg-primary/10 border-primary/20" },
  { level: 3, name: "数据模型层", desc: "统一数据模型", items: ["企业模型", "用户模型", "资产模型", "权限模型"], color: "bg-accent/10 border-accent/20" },
  { level: 2, name: "基础设施层", desc: "技术基础设施", items: ["MySQL 8.0", "Redis 7.0", "消息队列", "对象存储"], color: "bg-muted border-border" },
  { level: 1, name: "运维监控层", desc: "运维与监控", items: ["日志系统", "监控告警", "CI/CD", "灰度发布"], color: "bg-muted border-border" },
];

const products = [
  { code: "domestic_3d", name: "国内3D", desc: "面向国内市场的3D展示平台", features: ["3D展示", "方案设计", "渲染输出"] },
  { code: "international_3d", name: "国际3D", desc: "面向国际市场的3D展示平台", features: ["3D展示", "方案设计", "渲染输出"] },
  { code: "smart_guide", name: "智能导购", desc: "智能推荐和导购系统", features: ["商品展示", "智能推荐", "客户管理"] },
  { code: "precision_marketing", name: "精准营销", desc: "营销活动管理系统", features: ["营销活动", "数据分析"] },
  { code: "ai_designer_app", name: "AI设计家App", desc: "移动端设计应用", features: ["移动端设计", "轻量化功能"] },
];

export default function Architecture() {
  return (
    <div className="doc-prose">
      <PageHeader title="整体架构设计" description="七层架构全景图 — 支持多产品并行、能力独立演进、国内外统一" />

      {/* 7-layer architecture */}
      <h2>七层架构</h2>
      <div className="space-y-3 mb-10">
        {layers.map((l) => (
          <div key={l.level} className={`rounded-lg border p-4 ${l.color}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono bg-foreground/10 px-2 py-0.5 rounded">L{l.level}</span>
              <span className="font-semibold text-foreground">{l.name}</span>
              <span className="text-xs text-muted-foreground">— {l.desc}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {l.items.map((item) => (
                <span key={item} className="text-xs bg-card px-2.5 py-1 rounded border text-foreground">{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Product Matrix */}
      <h2>产品矩阵</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {products.map((p) => (
          <Card key={p.code}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {p.name}
                <code className="text-xs font-normal">{p.code}</code>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.features.map((f) => (
                  <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded">{f}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Architecture principles summary */}
      <h2>架构特点</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-2">统一数据层</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 企业、用户、资产、权限数据统一管理</li>
              <li>• 应用端产品只消费数据，不拥有数据</li>
              <li>• 数据变更通过统一后台管理系统</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-2">产品级隔离</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 产品是权限第一维度（主开关）</li>
              <li>• 产品之间互不影响，可独立演进</li>
              <li>• 国内3D和国际3D作为两个独立产品</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
