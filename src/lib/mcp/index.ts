import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import appInfoTool from "./tools/app-info";

export default defineMcp({
  name: "gongzuotai-mcp",
  title: "工作台 MCP",
  version: "0.1.0",
  instructions:
    "居然设计家管理后台的 MCP 服务。使用 `echo` 验证连通性，使用 `app_info` 获取平台信息。",
  tools: [echoTool, appInfoTool],
});
