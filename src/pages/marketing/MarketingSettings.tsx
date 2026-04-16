import { useState } from "react";
import {
  Sliders, Brain, Target, DollarSign, Shield,
  Save, RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  generateScoringDimensions, generateDistributionRules,
  type ScoringDimension, type DistributionRule,
} from "@/data/marketing";

const SCORING = generateScoringDimensions();
const DIST_RULES = generateDistributionRules();

function ScoringConfig() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" /> 意向评分模型
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs"><RotateCcw className="h-3 w-3 mr-1" /> 重置</Button>
          <Button size="sm" className="text-xs" onClick={() => toast.success("评分模型已保存")}><Save className="h-3 w-3 mr-1" /> 保存</Button>
        </div>
      </div>
      <div className="space-y-3">
        {SCORING.map((d) => (
          <div key={d.id} className="rounded-lg border border-border/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[13px] font-medium">{d.name}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{d.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">权重</span>
                <span className="text-lg font-bold text-primary">{d.weight}%</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {d.options.map((o) => (
                <div key={o.label} className="rounded-md border border-border/30 px-3 py-1.5 text-center min-w-[100px]">
                  <div className="text-[11px]">{o.label}</div>
                  <div className={`text-sm font-bold ${o.score >= 80 ? "text-emerald-600" : o.score >= 50 ? "text-amber-600" : "text-red-500"}`}>{o.score}分</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionConfig() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> 派发匹配规则
        </h3>
        <Button size="sm" className="text-xs" onClick={() => toast.success("派发规则已保存")}><Save className="h-3 w-3 mr-1" /> 保存</Button>
      </div>
      <div className="space-y-3">
        {DIST_RULES.map((r) => (
          <div key={r.id} className="rounded-lg border border-border/40 p-4 flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${r.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {r.weight}%
              </div>
              <div>
                <div className="text-[13px] font-medium">{r.name}</div>
                <div className="text-[10px] text-muted-foreground">{r.description}</div>
              </div>
            </div>
            <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary/60" style={{ width: `${r.weight}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncentiveConfig() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" /> 激励与保障规则
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { title: "质量保障金", fields: [
            { label: "保障金比例", value: "20%", desc: "按客资总额比例预收" },
            { label: "释放阈值", value: "反馈率≥60%", desc: "达到后自动释放保障金" },
            { label: "扣减规则", value: "投诉率>10%时扣减", desc: "每超1%扣减5%保障金" },
          ]},
          { title: "积分规则", fields: [
            { label: "有效反馈", value: "10分/条", desc: "提交跟进结果" },
            { label: "成交反馈", value: "50分/单", desc: "确认成交并回传数据" },
            { label: "兑换比例", value: "100分=1条优质客资", desc: "可兑换高意向线索" },
          ]},
          { title: "动态定价", fields: [
            { label: "基准价", value: "¥200/条", desc: "标准客资单价" },
            { label: "优惠价", value: "¥160/条", desc: "反馈率≥80%企业享受" },
            { label: "惩罚价", value: "¥280/条", desc: "反馈率<30%企业适用" },
          ]},
          { title: "清洗标准", fields: [
            { label: "号码校验", value: "必须通过", desc: "实号检测、空号过滤" },
            { label: "意向分阈值", value: "≥50分", desc: "低于此分数标记不合格" },
            { label: "重复检测", value: "90天去重", desc: "同号码90天内仅保留一条" },
          ]},
        ].map((section) => (
          <div key={section.title} className="rounded-lg border border-border/40 p-4 space-y-3">
            <div className="text-[13px] font-semibold">{section.title}</div>
            {section.fields.map((f) => (
              <div key={f.label} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                <div>
                  <div className="text-[11px]">{f.label}</div>
                  <div className="text-[10px] text-muted-foreground">{f.desc}</div>
                </div>
                <span className="text-sm font-medium text-primary">{f.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarketingSettings() {
  return (
    <div className="space-y-5">
      <PageHeader title="运营配置" subtitle="评分模型 · 派发规则 · 激励机制 · 清洗标准" />

      <Tabs defaultValue="scoring">
        <TabsList>
          <TabsTrigger value="scoring">评分模型</TabsTrigger>
          <TabsTrigger value="distribution">派发规则</TabsTrigger>
          <TabsTrigger value="incentive">激励与保障</TabsTrigger>
        </TabsList>
        <TabsContent value="scoring"><ScoringConfig /></TabsContent>
        <TabsContent value="distribution"><DistributionConfig /></TabsContent>
        <TabsContent value="incentive"><IncentiveConfig /></TabsContent>
      </Tabs>
    </div>
  );
}
