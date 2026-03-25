import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const entities = [
  {
    name: "Enterprise（企业）",
    fields: [
      { name: "id", type: "BIGINT PK", desc: "企业ID" },
      { name: "enterprise_code", type: "VARCHAR(50) UK", desc: "企业编码" },
      { name: "enterprise_name", type: "VARCHAR(100)", desc: "企业名称" },
      { name: "enterprise_type", type: "ENUM", desc: "企业类型(mall/brand/dealer/decoration/studio/store/custom)" },
      { name: "is_platform", type: "BOOLEAN", desc: "是否平台企业" },
      { name: "parent_id", type: "BIGINT FK", desc: "父企业ID" },
      { name: "status", type: "INT", desc: "状态(1=正常,0=停用)" },
    ],
  },
  {
    name: "Enterprise_Product（企业×产品）",
    fields: [
      { name: "enterprise_id", type: "VARCHAR(50) PK", desc: "企业ID" },
      { name: "product_code", type: "VARCHAR(50) PK", desc: "产品代码" },
      { name: "enabled", type: "BOOLEAN", desc: "是否启用" },
      { name: "entitlements", type: "JSON", desc: "该产品下的能力与权益集合" },
    ],
  },
  {
    name: "User（用户）",
    fields: [
      { name: "id", type: "BIGINT PK", desc: "用户ID" },
      { name: "name", type: "VARCHAR(100)", desc: "用户名" },
      { name: "enterprise_id", type: "BIGINT FK", desc: "所属企业" },
      { name: "email", type: "VARCHAR(100)", desc: "邮箱" },
      { name: "phone", type: "VARCHAR(20)", desc: "手机号" },
      { name: "status", type: "INT", desc: "状态" },
    ],
  },
  {
    name: "Role（角色）",
    fields: [
      { name: "id", type: "BIGINT PK", desc: "角色ID" },
      { name: "name", type: "VARCHAR(100)", desc: "角色名称" },
      { name: "role_type", type: "ENUM", desc: "角色类型(platform/enterprise)" },
      { name: "enterprise_id", type: "BIGINT FK", desc: "所属企业" },
      { name: "products", type: "JSON", desc: "关联产品" },
      { name: "menus", type: "JSON", desc: "菜单权限" },
      { name: "permissions", type: "JSON", desc: "操作权限" },
    ],
  },
  {
    name: "Menu（菜单）",
    fields: [
      { name: "id", type: "BIGINT PK", desc: "菜单ID" },
      { name: "name", type: "VARCHAR(100)", desc: "菜单名称" },
      { name: "menu_type", type: "ENUM", desc: "类型(basic/incremental/platform)" },
      { name: "group_type", type: "VARCHAR(50)", desc: "分组" },
      { name: "level", type: "INT", desc: "层级" },
      { name: "parent_id", type: "BIGINT FK", desc: "父菜单" },
      { name: "products", type: "JSON", desc: "支持的产品" },
      { name: "required_entitlement", type: "VARCHAR(100)", desc: "所需权益" },
    ],
  },
  {
    name: "Authorization（授权）",
    fields: [
      { name: "id", type: "BIGINT PK", desc: "授权ID" },
      { name: "asset_id", type: "BIGINT FK", desc: "资产ID" },
      { name: "from_enterprise_id", type: "BIGINT FK", desc: "授权方" },
      { name: "to_enterprise_id", type: "BIGINT FK", desc: "被授权方" },
      { name: "authorization_type", type: "ENUM", desc: "授权类型" },
      { name: "current_depth", type: "INT", desc: "当前深度" },
      { name: "max_transfer_depth", type: "INT", desc: "最大传递深度" },
      { name: "can_transfer", type: "BOOLEAN", desc: "是否可转授" },
    ],
  },
];

const enterpriseTypes = [
  { type: "卖场 (mall)", brand: "拥有/代理", supply: "可选", model: "公有+企业+私有" },
  { type: "品牌商 (brand)", brand: "拥有/代理", supply: "可选", model: "公有+企业+私有" },
  { type: "经销商 (dealer)", brand: "代理", supply: "可选", model: "企业+私有" },
  { type: "装修公司 (decoration)", brand: "无关", supply: "否", model: "企业+私有" },
  { type: "工作室 (studio)", brand: "无关", supply: "否", model: "私有" },
  { type: "门店 (store)", brand: "无关", supply: "否", model: "私有" },
  { type: "自定义 (custom)", brand: "任意", supply: "可选", model: "可配置" },
];

export default function DataModels() {
  return (
    <div className="doc-prose">
      <PageHeader title="核心数据模型" description="企业、用户、权限、资产等核心实体的数据结构定义" />

      {/* Enterprise Types */}
      <h2>企业类型映射</h2>
      <Card className="mb-8">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>企业类型</TableHead>
                <TableHead>品牌关系</TableHead>
                <TableHead>供应链</TableHead>
                <TableHead>素材权限</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enterpriseTypes.map((t) => (
                <TableRow key={t.type}>
                  <TableCell className="font-medium text-foreground">{t.type}</TableCell>
                  <TableCell><span className="text-xs bg-muted px-2 py-0.5 rounded">{t.brand}</span></TableCell>
                  <TableCell><span className="text-xs bg-muted px-2 py-0.5 rounded">{t.supply}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.model}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Entity Definitions */}
      <h2>实体定义</h2>
      <div className="space-y-6">
        {entities.map((entity) => (
          <Card key={entity.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">{entity.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">字段名</TableHead>
                    <TableHead className="w-[160px]">类型</TableHead>
                    <TableHead>说明</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entity.fields.map((f) => (
                    <TableRow key={f.name}>
                      <TableCell className="font-mono text-xs text-primary">{f.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{f.type}</TableCell>
                      <TableCell className="text-sm">{f.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
