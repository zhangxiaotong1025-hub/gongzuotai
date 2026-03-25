import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const techRisks = [
  { risk: "数据迁移复杂", level: "高", impact: "部分3D模型、全景图资源依赖淘宝体系", solution: "优先迁移P0资产，其他依赖资源通过收费/暂停处理" },
  { risk: "权限逻辑混乱", level: "中", impact: "企业层级复杂，品牌关系决定资产访问", solution: "建立清晰权限模型，严格约束访问范围" },
  { risk: "性能问题", level: "中", impact: "百万级资产、万级企业并发访问", solution: "多级缓存、读写分离、数据库分表分库" },
  { risk: "技术债务", level: "中", impact: "历史遗留架构复杂，跨平台映射困难", solution: "分阶段重构，采用AI Coding辅助开发" },
];

const bizRisks = [
  { risk: "用户迁移率低", level: "高", impact: "国内版用户不愿意迁移到新系统", solution: "提供迁移激励、保证平滑迁移、提供培训" },
  { risk: "功能不满足需求", level: "中", impact: "新系统功能不如旧系统", solution: "充分调研用户需求、分阶段交付、快速迭代" },
  { risk: "国内外差异过大", level: "中", impact: "统一建设困难", solution: "功能开关、权益差异、配置差异" },
];

const projectRisks = [
  { risk: "项目延期", level: "中", impact: "影响上线时间", solution: "精准范围评估、优先做核心模块、非核心可延期" },
  { risk: "人力不足", level: "中", impact: "影响开发进度", solution: "合理分配人力、采用AI Coding提高效率" },
  { risk: "需求变更", level: "低", impact: "影响开发计划", solution: "需求冻结、变更评审、优先级排序" },
];

function RiskTable({ risks }: { risks: typeof techRisks }) {
  return (
    <div className="space-y-3">
      {risks.map((r) => (
        <Card key={r.risk}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className={`status-badge ${r.level === "高" ? "status-risk-high" : r.level === "中" ? "status-risk-medium" : "status-risk-low"}`}>
                {r.level}风险
              </span>
              <span className="font-medium text-foreground text-sm">{r.risk}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-medium">影响：</span>{r.impact}
            </p>
            <p className="text-xs text-accent">
              <span className="font-medium">应对：</span>{r.solution}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Risks() {
  return (
    <div className="doc-prose">
      <PageHeader title="风险评估" description="技术风险、业务风险、项目风险的识别与应对策略" />

      <h2>技术风险</h2>
      <RiskTable risks={techRisks} />

      <h2>业务风险</h2>
      <RiskTable risks={bizRisks} />

      <h2>项目风险</h2>
      <RiskTable risks={projectRisks} />
    </div>
  );
}
