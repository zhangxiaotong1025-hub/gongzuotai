import {
  Building2, Gift, Megaphone, Store, Bot, Shield,
  AlertTriangle, Sparkles, TrendingUp, Workflow, Database, Target,
} from "lucide-react";

/**
 * 项目汇报 · 一页讲清楚
 * 路由：/prd/pitch
 */
export default function ProjectPitch() {
  return (
    <div className="space-y-4">
      {/* ============== Hero ============== */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-6">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-mono">PROJECT REPORT · 2026Q2</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[11px] font-mono">v1 · Released</span>
            </div>
            <h1 className="text-[28px] font-bold leading-tight">
              居然设计家 · 中台重构
              <span className="block text-[15px] font-normal text-muted-foreground mt-1">
                把"卖软件"的旧后台，重做成一座"经营家居生态"的中台
              </span>
            </h1>
            <p className="text-[13px] text-muted-foreground">
              以 <b className="text-foreground">企业为唯一租户</b>、<b className="text-foreground">产品为第一权限维度</b>、<b className="text-foreground">订单为分发唯一入口</b>，
              贯通 <b className="text-foreground">企业 / 权限 / 权益 / 客户 / 营销 / 商家 / Agent</b> 七大业务域，让平台既能做 SaaS，又能做生态运营。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 min-w-[300px]">
            {[
              { l: "业务域", v: "7" },
              { l: "核心模块", v: "40+" },
              { l: "实体表", v: "30+" },
              { l: "状态机", v: "12" },
              { l: "BI 指标", v: "60+" },
              { l: "PRD 章节", v: "50+" },
            ].map(k => (
              <div key={k.l} className="bg-background/60 border rounded-lg p-2.5 backdrop-blur text-center">
                <div className="text-[10.5px] text-muted-foreground">{k.l}</div>
                <div className="text-[18px] font-bold text-primary mt-0.5">{k.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============== 三段式：问题 → 做了什么 → 价值 ============== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 问题 */}
        <div className="rounded-xl border bg-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-[15px] font-semibold">解决了什么问题</h2>
          </div>
          <ul className="space-y-2.5 text-[12.5px]">
            {[
              ["旧后台只为「卖 3D 软件」服务", "无法承载企业入驻、权益分发、客资经营等生态化业务"],
              ["客资生命周期断裂", "线索分发后跟进黑盒，34% 反馈率，CAC 持续上涨"],
              ["权益规则散落在 5 端", "新能力上线 ≥ 2 周，对账靠人工，账户消耗无法溯源"],
              ["企业数据互不连通", "总部/子公司/品牌商权限混乱，审核、冻结、续费各做各的"],
              ["缺少经营视角", "平台只看 GMV，看不见客户健康度、商家分级、续费风险"],
            ].map(([t, s]) => (
              <li key={t} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{t}</div>
                  <div className="text-muted-foreground text-[11.5px] leading-relaxed">{s}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 做了什么 */}
        <div className="rounded-xl border bg-card p-5 border-l-4 border-l-primary">
          <div className="flex items-center gap-2 mb-3">
            <Workflow className="h-4 w-4 text-primary" />
            <h2 className="text-[15px] font-semibold">做了什么</h2>
          </div>
          <ul className="space-y-2.5 text-[12.5px]">
            {[
              [Building2, "企业中台", "6 类企业 × 3 级组织 × 入驻审核 × 状态联动"],
              [Shield, "权限体系", "菜单-策略-角色三层模型，按企业属性跨角色可见"],
              [Gift, "权益管理", "应用→能力→规则→产品→商品→订单→账户 8 层链路打通"],
              [Megaphone, "智能营销", "线索池 + AI 外呼 + 智能派发 + 跟进追踪 + 结算"],
              [Store, "商家工作台", "客资 → 签单 → 交付 → 评价 → 老客复购 闭环"],
              [Bot, "经营 Agent", "数据驱动建议、健康分预警、营销 ROI 复盘"],
            ].map(([Icon, t, s]: any) => (
              <li key={t} className="flex gap-2.5 items-start">
                <div className="mt-0.5 h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{t}</div>
                  <div className="text-muted-foreground text-[11.5px] leading-relaxed">{s}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 价值 */}
        <div className="rounded-xl border bg-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <h2 className="text-[15px] font-semibold">产品价值</h2>
          </div>
          <ul className="space-y-2.5 text-[12.5px]">
            {[
              ["对平台", "从「卖席位」升级到「经营生态」，多一条客资分发收入曲线"],
              ["对研发", "新能力上线 ≤ 1 天（原 ≥ 2 周），对账 0 误差"],
              ["对客成", "账户消耗全链路溯源，健康分预警，续费可预测"],
              ["对商家", "工具→数据→分级→优质客资 飞轮闭环，B/C 商家有上升通道"],
              ["对组织", "一套底座承载 SaaS + 生态运营，避免重复造轮子"],
            ].map(([t, s]) => (
              <li key={t} className="flex gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{t}</div>
                  <div className="text-muted-foreground text-[11.5px] leading-relaxed">{s}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ============== 系统骨架一图流 ============== */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="text-[15px] font-semibold">系统骨架 · 一图看懂数据流</h2>
          <span className="text-[11.5px] text-muted-foreground">配置侧（蓝） → 履约侧（绿） → 运行侧（紫）</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 配置侧 */}
          <div className="rounded-lg border-2 border-dashed border-blue-500/40 bg-blue-500/5 p-3">
            <div className="text-[11px] font-mono text-blue-600 mb-2">CONFIG · 一次定义多次使用</div>
            <div className="space-y-1.5">
              {["企业 Enterprise", "应用 App", "能力 Capability", "规则 Rule", "权益产品 Product", "商品 SKU / 套餐"].map(x => (
                <div key={x} className="bg-card border rounded px-2.5 py-1.5 text-[12px] font-medium">{x}</div>
              ))}
            </div>
          </div>
          {/* 履约侧 */}
          <div className="rounded-lg border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 p-3">
            <div className="text-[11px] font-mono text-emerald-600 mb-2">FULFILL · 一笔订单一份账目</div>
            <div className="space-y-1.5">
              {["客户 Customer", "订单 Order（三维状态）", "账户 Account（按客户×应用聚合）", "消耗 Usage（带 order_id 溯源）"].map(x => (
                <div key={x} className="bg-card border rounded px-2.5 py-1.5 text-[12px] font-medium">{x}</div>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
              企业禁用 → 订单冻结 → 账户停扣，历史不删
            </div>
          </div>
          {/* 运行侧 */}
          <div className="rounded-lg border-2 border-dashed border-purple-500/40 bg-purple-500/5 p-3">
            <div className="text-[11px] font-mono text-purple-600 mb-2">RUNTIME · 事件驱动</div>
            <div className="space-y-1.5">
              {["营销线索池 + AI 外呼", "智能派发 → 商家工作台", "客户健康分 / 画像", "BI 看板 + Agent 建议", "对账 / 续费 / 风控"].map(x => (
                <div key={x} className="bg-card border rounded px-2.5 py-1.5 text-[12px] font-medium">{x}</div>
              ))}
            </div>
          </div>
        </div>

        {/* 7 公理 */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3.5 w-3.5 text-primary" />
            <span className="text-[12px] font-semibold">7 条设计公理（贯穿所有模块）</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[11.5px]">
            {[
              "企业 = 唯一租户身份",
              "产品 = 第一权限维度",
              "订单 = 分发唯一入口",
              "账户 = 客户×应用 聚合",
              "状态三维解耦（审核/支付/生命周期）",
              "三层隔离（平台/企业/用户）",
              "企业状态联动一切",
              "事件驱动 · 数据资产化",
            ].map(x => (
              <div key={x} className="px-2 py-1 rounded bg-muted/60 border text-foreground/80">{x}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ============== 一句话收尾 ============== */}
      <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-transparent p-4 text-center">
        <p className="text-[13px] text-foreground/90">
          <b>这不是一个"还行"的后台，是一个能站住十年的骨架。</b>
          <span className="text-muted-foreground ml-1">剩下的，就是慢慢长肉。</span>
        </p>
      </div>
    </div>
  );
}
