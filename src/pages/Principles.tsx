import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const principles = [
  {
    id: 0,
    title: "产品是权限的第一维度（主开关）",
    rating: "⭐⭐⭐⭐⭐",
    score: 99,
    desc: "产品是权限控制的第一维度，企业只有启用某个产品后，才进入该产品的权限空间。",
    flow: "产品(Product) → 企业×产品关系 → 权益集合 → 菜单",
    benefits: ["支持多产品并行", "支持国内外统一", "支持产品级权限控制", "新增产品不影响现有逻辑"],
  },
  {
    id: 1,
    title: "平台即企业",
    rating: "⭐⭐⭐",
    score: 98,
    desc: "平台本身是一个特殊的企业（is_platform = TRUE），与普通企业使用同一数据模型。",
    benefits: ["统一数据模型，简化逻辑", "平台资产转企业 = 修改 owner_enterprise_id", "易于理解和维护"],
  },
  {
    id: 2,
    title: "三库分离",
    rating: "⭐⭐",
    score: 96,
    desc: "资产分为公有库（PUBLIC）、品牌库（BRAND）、私有库（PRIVATE）三种使用范围。",
    benefits: ["职责清晰，权限明确", "支持多种业务场景", "灵活性高，易于管理"],
  },
  {
    id: 3,
    title: "资产归属 ≠ 使用范围",
    rating: "⭐⭐",
    score: 95,
    desc: "资产的归属（owner）、可见性（usage_scope）、操作权限（authorization）三者分离。",
    benefits: ["概念清晰，逻辑分离", "支持复杂的权限场景", "易于扩展和调整"],
  },
  {
    id: 4,
    title: "权益体系控制访问",
    rating: "⭐⭐",
    score: 94,
    desc: "通过权益包和权益点控制企业对功能和资产的访问。权益包分豪华版/标准版/基础版。",
    benefits: ["层次清晰，易于管理", "支持灵活配置", "支持增量配置", "支持国内外差异化"],
  },
  {
    id: 5,
    title: "授权可传递但有限制",
    rating: "⭐⭐",
    score: 93,
    desc: "授权可以传递（A→B→C），但有深度限制（max_depth），防止无限传递。",
    benefits: ["支持多级分销", "防止无限传递", "可追溯授权链", "支持级联撤销"],
  },
  {
    id: 6,
    title: "商品授权自动附带模型权限",
    rating: "⭐⭐⭐",
    score: 97,
    desc: "核心创新：当商品被授权时，关联的模型权限自动附带，根据关系类型决定授权类型。",
    benefits: ["简化操作", "保证一致性", "防止滥用", "灵活控制"],
  },
  {
    id: 7,
    title: "版本管理 + 自动同步",
    rating: "⭐",
    score: 88,
    desc: "资产支持语义化版本管理，衍生资产可以自动同步源资产的更新。",
    benefits: ["版本可追溯", "自动同步减少人工操作", "支持冲突检测"],
  },
  {
    id: 8,
    title: "分阶段迁移 + 映射关系",
    rating: "⭐⭐",
    score: 92,
    desc: "从淘宝体系迁移到新系统，分P0/P1/P2三阶段进行，保留映射关系支持回滚。",
    benefits: ["降低风险，分阶段验证", "可追溯", "支持回滚", "详细日志"],
  },
  {
    id: 9,
    title: "多产品矩阵 + 统一控制",
    rating: "⭐⭐",
    score: 95,
    desc: "多个应用端产品共享统一的数据和权限，但能力独立配置。",
    benefits: ["统一数据，避免数据孤岛", "统一权限", "产品独立演进", "应用层解耦"],
  },
  {
    id: 10,
    title: "企业类型不参与运行期权限判断（铁律）",
    rating: "⭐⭐⭐⭐⭐",
    score: 99,
    desc: "企业类型只是初始化模板，运行期权限判断依据：启用的产品、权益配置、品牌关系、供应链关系、用户角色。",
    benefits: ["企业类型变化不影响权限逻辑", "支持灵活配置", "避免硬编码判断", "架构稳定"],
  },
];

export default function Principles() {
  return (
    <div className="doc-prose">
      <PageHeader title="核心设计原则" description="11条核心设计原则 — 指导整体架构设计和实现" badge="平均 95.1 分" />

      <div className="space-y-4">
        {principles.map((p) => (
          <Card key={p.id} className={p.score >= 97 ? "border-primary/30" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-3">
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded shrink-0">#{p.id}</span>
                <span className="flex-1">{p.title}</span>
                <span className="text-xs text-muted-foreground">{p.rating}</span>
                <span className={`status-badge ${p.score >= 97 ? "status-progress" : p.score >= 93 ? "status-done" : "status-todo"}`}>
                  {p.score}分
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{p.desc}</p>
              {p.flow && (
                <div className="bg-muted/50 rounded px-3 py-2 mb-3 font-mono text-xs text-primary">
                  {p.flow}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {p.benefits.map((b) => (
                  <span key={b} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">✅ {b}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
