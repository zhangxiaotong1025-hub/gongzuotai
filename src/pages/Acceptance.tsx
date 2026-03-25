import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const funcCriteria = [
  {
    module: "企业管理模块",
    items: [
      "支持5种企业类型的创建",
      "支持企业组织架构管理（3层）",
      "支持品牌关系管理（拥有、代理）",
      "支持权益配置（权益包、增量配置）",
      "支持企业列表查询（筛选、搜索、分页）",
      "支持企业详情查看、编辑、删除",
    ],
    performance: ["企业列表查询 < 500ms", "企业创建 < 1s", "1000+企业并发"],
  },
  {
    module: "入驻申请模块",
    items: [
      "支持申请列表查询（筛选、搜索、分页）",
      "支持申请详情查看",
      "支持申请审核（通过、拒绝）",
      "支持申请转企业",
    ],
    performance: ["申请列表查询 < 500ms", "审核响应 < 1s"],
  },
];

const nonFuncCriteria = [
  { category: "性能", items: ["P95响应 < 500ms", "1000+并发用户", "可用性 ≥ 99.9%", "最大连接数 100"] },
  { category: "安全", items: ["JWT Token认证", "RBAC权限控制", "敏感数据加密", "SQL注入防护"] },
  { category: "可维护性", items: ["代码覆盖率 ≥ 80%", "ESLint/Checkstyle检查", "完整API文档", "关键操作日志"] },
];

export default function Acceptance() {
  return (
    <div className="doc-prose">
      <PageHeader title="验收标准" description="功能验收标准、非功能验收标准" />

      <h2>功能验收标准</h2>
      <div className="space-y-4 mb-10">
        {funcCriteria.map((c) => (
          <Card key={c.module}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{c.module}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {c.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {c.performance.map((p) => (
                  <span key={p} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{p}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2>非功能验收标准</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {nonFuncCriteria.map((c) => (
          <Card key={c.category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{c.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {c.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
