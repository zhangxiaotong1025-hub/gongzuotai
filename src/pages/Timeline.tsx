import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const phases = [
  { name: "需求梳理与范围确认", week: "Week 1", owner: "产品经理", output: "功能清单、业务关系文档", progress: 100 },
  { name: "架构设计与数据模型设计", week: "Week 2-3", owner: "产品经理 + CTO + 研发TL", output: "系统架构图、表级清单", progress: 80 },
  { name: "P0模块开发（第一期）", week: "Week 4-5", owner: "研发团队", output: "企业管理模块", progress: 0 },
  { name: "P1模块开发（第二期）", week: "Week 6-13", owner: "研发团队", output: "资产管理、权限管理模块", progress: 0 },
  { name: "P2模块开发（第三期）", week: "Week 14-21", owner: "研发团队", output: "营销管理模块", progress: 0 },
  { name: "测试与验证", week: "Week 22-23", owner: "QA团队", output: "功能验收、权限校验、数据迁移测试", progress: 0 },
  { name: "上线部署", week: "Week 24", owner: "运维团队", output: "国内版完全脱淘上线", progress: 0 },
];

const p0Tasks = [
  { task: "数据库表创建", duration: "0.5天", owner: "后端开发", output: "10张核心表" },
  { task: "后端实体类和枚举", duration: "0.5天", owner: "后端开发", output: "Entity、Enum" },
  { task: "后端 DAO 层", duration: "1天", owner: "后端开发", output: "Mapper、XML" },
  { task: "后端 Service 层", duration: "2天", owner: "后端开发", output: "Service、ServiceImpl" },
  { task: "后端 Controller 层", duration: "1天", owner: "后端开发", output: "Controller、DTO、VO" },
  { task: "前端企业列表页", duration: "1天", owner: "前端开发", output: "列表、筛选、搜索、分页" },
  { task: "前端企业新增页", duration: "2天", owner: "前端开发", output: "分步骤表单" },
  { task: "前端企业编辑页", duration: "1天", owner: "前端开发", output: "编辑表单" },
  { task: "前端企业详情页", duration: "1天", owner: "前端开发", output: "详情展示" },
  { task: "联调测试", duration: "1天", owner: "全员", output: "功能验证" },
  { task: "Bug修复", duration: "1天", owner: "全员", output: "Bug清零" },
];

const techStack = {
  backend: ["Spring Boot 2.7.x", "MyBatis Plus 3.5.x", "MySQL 8.0", "Redis 7.0", "Maven 3.8.x", "JDK 1.8"],
  frontend: ["React 18.x", "Ant Design 5.x", "TypeScript 5.x", "Vite 5.x", "Redux Toolkit", "React Router 6.x"],
};

export default function Timeline() {
  return (
    <div className="doc-prose">
      <PageHeader title="项目计划" description="整体时间线、详细计划、技术栈" badge="24周" />

      {/* Overall Timeline */}
      <h2>整体时间线</h2>
      <div className="space-y-3 mb-10">
        {phases.map((p) => (
          <Card key={p.name}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded shrink-0 w-24 text-center">{p.week}</span>
                <span className="font-medium text-foreground flex-1 text-sm">{p.name}</span>
                <span className={`status-badge ${p.progress === 100 ? "status-done" : p.progress > 0 ? "status-progress" : "status-todo"}`}>
                  {p.progress === 100 ? "已完成" : p.progress > 0 ? "进行中" : "待开始"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={p.progress} className="flex-1 h-1.5" />
                <span className="text-xs text-muted-foreground shrink-0">{p.owner}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">输出：{p.output}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* P0 Detail */}
      <h2>P0 详细计划（Week 4-5）</h2>
      <Card className="mb-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">企业管理模块 — 2周（10个工作日）</CardTitle>
          <p className="text-xs text-muted-foreground">人力：后端1人、前端1人、测试0.5人</p>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务</TableHead>
                <TableHead>工期</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>输出</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {p0Tasks.map((t) => (
                <TableRow key={t.task}>
                  <TableCell className="font-medium text-foreground text-sm">{t.task}</TableCell>
                  <TableCell className="text-xs">{t.duration}</TableCell>
                  <TableCell>
                    <span className={`status-badge ${t.owner === "后端开发" ? "bg-primary/10 text-primary" : t.owner === "前端开发" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {t.owner}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.output}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <h2>技术栈</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">后端技术栈</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.backend.map((t) => (
                <span key={t} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded">{t}</span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">前端技术栈</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.frontend.map((t) => (
                <span key={t} className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded">{t}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
