import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "app_info",
  title: "App info",
  description: "Return basic information about this admin platform (居然设计家 管理后台).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            name: "居然设计家 管理后台",
            description:
              "3D 家装设计 SaaS 的 B 端管理后台，覆盖企业管理、权益、人员、商品、营销、客户等模块。",
            modules: [
              "enterprise",
              "staff",
              "brand",
              "product",
              "model",
              "entitlement",
              "customer",
              "marketing",
              "permission",
              "agent",
              "prd",
            ],
          },
          null,
          2,
        ),
      },
    ],
  }),
});
