import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const modules = [
  {
    group: "权限管理",
    items: [
      { name: "菜单管理", scope: "平台菜单", permission: "/", pages: ["菜单列表页", "创建页面"], features: ["创建", "编辑", "删除"] },
      { name: "策略管理", scope: "平台菜单", permission: "/", pages: ["策略列表页", "创建页面"], features: ["创建", "编辑", "删除"] },
      { name: "角色管理", scope: "平台菜单", permission: "/", pages: ["角色列表页", "创建页面"], features: ["创建", "编辑", "删除"] },
    ],
  },
  {
    group: "企业管理",
    items: [
      { name: "企业管理", scope: "通用菜单", permission: "/", pages: ["企业列表页", "创建页面(分步骤)", "编辑页面", "详情页面"], features: ["创建", "编辑", "删除"] },
      { name: "人员管理", scope: "通用菜单", permission: "/", pages: ["人员列表页", "创建页面", "详情页面"], features: ["创建", "编辑", "删除", "分配角色"] },
    ],
  },
  {
    group: "权益管理",
    items: [
      { name: "权益包管理", scope: "平台菜单", permission: "/", pages: ["权益包列表页", "创建页面"], features: ["创建", "编辑", "删除"] },
      { name: "权益管理", scope: "平台菜单", permission: "/", pages: ["权益列表页", "创建页面"], features: ["创建", "编辑", "删除"] },
    ],
  },
  {
    group: "品牌管理",
    items: [
      { name: "品牌管理", scope: "通用菜单", permission: "/", pages: ["品牌列表页", "创建页面", "详情页面"], features: ["创建", "编辑", "删除", "新建系列"] },
    ],
  },
  {
    group: "素材管理",
    items: [
      { name: "平台素材 · 模型管理", scope: "通用菜单", permission: "企业类型/品牌关系", pages: ["模型列表页", "创建页面", "详情页面"], features: ["上传", "审核", "上下架"] },
      { name: "平台素材 · 材质管理", scope: "通用菜单", permission: "企业类型/品牌关系", pages: ["材质列表页", "上传页面"], features: ["上传", "编辑", "删除"] },
      { name: "企业素材 · 模型管理", scope: "通用菜单", permission: "/", pages: ["模型列表页"], features: ["上传", "编辑", "删除"] },
      { name: "企业素材 · 材质管理", scope: "通用菜单", permission: "/", pages: ["材质列表页"], features: ["上传", "编辑", "删除"] },
    ],
  },
  {
    group: "商品管理",
    items: [
      { name: "商品管理", scope: "通用菜单", permission: "企业类型/供应链", pages: ["商品列表页", "创建页面"], features: ["创建", "编辑", "删除"] },
    ],
  },
  {
    group: "方案管理",
    items: [
      { name: "方案管理", scope: "通用菜单", permission: "/", pages: ["方案列表页"], features: ["查看", "编辑", "删除"] },
      { name: "样板间管理", scope: "通用菜单", permission: "/", pages: ["样板间列表页"], features: ["查看", "编辑"] },
    ],
  },
  {
    group: "营销管理",
    items: [
      { name: "广告位管理", scope: "智能导购", permission: "/", pages: ["广告位列表页"], features: ["创建", "编辑"] },
      { name: "选品池管理", scope: "智能导购", permission: "/", pages: ["选品池列表页"], features: ["创建", "编辑"] },
      { name: "布局管理", scope: "智能导购", permission: "/", pages: ["布局列表页"], features: ["创建", "编辑"] },
      { name: "优惠管理", scope: "智能导购", permission: "/", pages: ["优惠列表页"], features: ["创建", "编辑"] },
    ],
  },
];

export default function Modules() {
  return (
    <div className="doc-prose">
      <PageHeader title="模块梳理" description="系统所有一级/二级/三级模块及其权限和功能说明" />

      <div className="space-y-6">
        {modules.map((group) => (
          <Card key={group.group}>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h3 className="font-semibold text-foreground text-sm">{group.group}</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">模块名称</TableHead>
                      <TableHead className="w-[100px]">菜单类型</TableHead>
                      <TableHead className="w-[140px]">权限要求</TableHead>
                      <TableHead>关键页面</TableHead>
                      <TableHead>核心功能</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                        <TableCell>
                          <span className={`status-badge ${item.scope === "平台菜单" ? "bg-primary/10 text-primary" : item.scope === "智能导购" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                            {item.scope}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.permission}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.pages.map((p) => (
                              <span key={p} className="text-xs bg-muted px-1.5 py-0.5 rounded">{p}</span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.features.map((f) => (
                              <span key={f} className="text-xs bg-primary/5 text-primary px-1.5 py-0.5 rounded">{f}</span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
