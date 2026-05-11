import { Mermaid, DesignCard, PrdPageHeader, H } from "@/components/prd/Mermaid";
import { Rocket, Target, ShieldCheck, Users } from "lucide-react";

export default function Delivery() {
  return (
    <div className="space-y-10">
      <PrdPageHeader
        eyebrow="PRD · ENTITLEMENT · DELIVERY · v1"
        title="落地三基石 + 里程碑 + 灰度方案"
        subtitle="工程落地的三块基石：可观测性、对账闭环、灰度开关。配合 5 个里程碑（M0~M4）与按企业灰度策略，确保切换零事故。"
        meta={<span>SDS-2026.05 · v1</span>}
      />

      <section id="dl-stone" className="scroll-mt-4">
        <H icon={ShieldCheck}>三基石 · 上线前必须就位</H>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <DesignCard code="OBS" title="基石一 · 可观测" tone="primary">
            • trace_id 贯穿：订单 → Grant → 账户 → 消耗<br/>
            • 每个状态机迁移记录指标：成功率、迁移时延<br/>
            • Outbox 积压、Kafka lag、Redis Lua 失败率全告警
          </DesignCard>
          <DesignCard code="REC" title="基石二 · 对账闭环" tone="accent">
            • 日终任务：订单合计 = 账户增量 + 退款<br/>
            • 周对账：消耗合计 = 账户 used 增量<br/>
            • 月对账：财务收入 = paid 订单 − 退款，0 误差
          </DesignCard>
          <DesignCard code="GR" title="基石三 · 灰度开关" tone="warning">
            • 按 enterprise_id 取模灰度，1% → 10% → 50% → 100%<br/>
            • 老流程双写 30 天，新旧账户额度对比为 0 才下线<br/>
            • 应急回滚：开关秒级切回旧链路
          </DesignCard>
        </div>
      </section>

      <section id="dl-gantt" className="scroll-mt-4">
        <H icon={Rocket}>里程碑 · 12 周交付</H>
        <Mermaid
          caption="M0 立项 → M4 全量切换"
          chart={`gantt
  title 权益管理系统 · 里程碑
  dateFormat  YYYY-MM-DD
  axisFormat  %m/%d
  section M0 立项
    PRD 评审 + DDL 冻结        :done, m0a, 2026-05-12, 7d
  section M1 配置侧
    应用 / 能力 / 规则 / 产品   :active, m1a, 2026-05-19, 14d
    SKU / 套餐 + 价格快照      : m1b, after m1a, 7d
  section M2 履约侧
    订单三维状态机             : m2a, after m1b, 14d
    Grant + 账户 + 消耗(Lua)   : m2b, after m2a, 14d
  section M3 集成
    Outbox + Kafka + 事件契约  : m3a, after m2b, 7d
    数仓 ODS→ADS + 画像        : m3b, after m3a, 7d
  section M4 灰度
    按企业 1% → 100%          : m4a, after m3b, 21d
    旧链路下线                : m4b, after m4a, 7d`}
        />
      </section>

      <section id="dl-rollout" className="scroll-mt-4">
        <H icon={Target}>灰度策略 · 按企业 + 双写对比</H>
        <Mermaid
          caption="新旧链路双写 30 天，账户差异 = 0 才允许下线旧链路"
          chart={`graph LR
  REQ[下单请求] --> GW[网关 · feature flag]
  GW -->|hash(ent_id) % 100 < N| NEW[新订单服务]
  GW -->|else| OLD[旧订单服务]
  NEW --> ACC1[新账户表]
  OLD --> ACC2[旧账户表]
  ACC1 --> CMP[对比任务<br/>每 5 min]
  ACC2 --> CMP
  CMP -->|差异 ≠ 0| ALERT[P1 告警 · 暂停灰度]
  CMP -->|差异 = 0 持续 30d| CUT[切流 100% + 下线旧]`}
        />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <DesignCard code="ROLLOUT" title="放量节奏" tone="primary">
            Day 1-3：1% 内部测试企业<br/>
            Day 4-10：10% 中小企业<br/>
            Day 11-20：50% 全量企业<br/>
            Day 21-30：100% + 旧链路只读
          </DesignCard>
          <DesignCard code="ROLLBACK" title="回滚预案" tone="warning">
            P0：账户差异 / 对账失败 → 30 秒内切回旧链路<br/>
            P1：单接口错误率 &gt; 1% → 暂停放量、保持现状<br/>
            P2：性能不达标 → 限流 + 异步化改造
          </DesignCard>
        </div>
      </section>

      <section id="dl-raci" className="scroll-mt-4">
        <H icon={Users}>组织协作 · RACI</H>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-[12.5px]">
            <thead className="bg-muted/40 text-foreground/80">
              <tr>
                <th className="text-left px-3 py-2 font-medium">职责</th>
                <th className="text-left px-3 py-2 font-medium">产品</th>
                <th className="text-left px-3 py-2 font-medium">后端</th>
                <th className="text-left px-3 py-2 font-medium">前端</th>
                <th className="text-left px-3 py-2 font-medium">数据</th>
                <th className="text-left px-3 py-2 font-medium">运营</th>
                <th className="text-left px-3 py-2 font-medium">财务</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-3 [&_td]:py-2 [&_tr]:border-t">
              <tr><td>PRD / 状态机</td><td>R/A</td><td>C</td><td>C</td><td>C</td><td>I</td><td>I</td></tr>
              <tr><td>DDL / API / Outbox</td><td>C</td><td>R/A</td><td>C</td><td>C</td><td>I</td><td>I</td></tr>
              <tr><td>管理后台 / 客户端</td><td>C</td><td>C</td><td>R/A</td><td>I</td><td>C</td><td>I</td></tr>
              <tr><td>数仓 / 画像 / BI</td><td>C</td><td>C</td><td>I</td><td>R/A</td><td>C</td><td>C</td></tr>
              <tr><td>对账 / 财务结算</td><td>C</td><td>C</td><td>I</td><td>C</td><td>I</td><td>R/A</td></tr>
              <tr><td>灰度 / 回滚</td><td>A</td><td>R</td><td>R</td><td>C</td><td>C</td><td>I</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11.5px] text-muted-foreground mt-2">R=负责执行 · A=最终责任 · C=咨询 · I=知会</p>
      </section>

      <section id="dl-ga" className="scroll-mt-4">
        <H icon={ShieldCheck}>验收清单 · GA 必过项</H>
        <div className="rounded-xl border bg-emerald-50/60 border-emerald-200 p-4">
          <ul className="text-[12.5px] space-y-1.5 text-foreground/85 list-disc pl-5">
            <li>3 类订单（付费 / 内部赠送 / 企业入驻）端到端用例 100% 通过</li>
            <li>消耗扣减 P99 ≤ 30 ms（10 k QPS 压测 30 min）</li>
            <li>对账任务连续 7 天 0 差异</li>
            <li>退款 / 撤销发放 / 负债账三种边界场景演练通过</li>
            <li>双写期间新旧账户余额一致性 ≥ 30 天</li>
            <li>所有领域事件在 Schema Registry 注册并 BACKWARD 兼容</li>
            <li>RLS 攻防测试：跨租户读写均失败</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
