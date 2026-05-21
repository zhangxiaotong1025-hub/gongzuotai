import { useRef, useState, useEffect } from "react";
import {
  ShieldAlert, Unplug, Sparkles, Layers3, Globe2, Database,
  TrendingUp, ArrowRight, CheckCircle2, AlertTriangle, Calendar,
  Target, Cpu, Building2, Grid3x3, Maximize2, Minimize2,
} from "lucide-react";

/**
 * 脱淘项目 · 项目价值与节奏（PPT 风格平铺）
 * 路由：/prd/ceo
 */
export default function CeoReport() {
  const ref = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);

  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const toggleFs = () => {
    if (!document.fullscreenElement) ref.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <div ref={ref} className="relative bg-background">
      {/* 全屏按钮 */}
      <button
        onClick={toggleFs}
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-lg border bg-card/90 backdrop-blur px-3 py-1.5 text-[12px] text-foreground/80 hover:text-foreground hover:bg-card shadow-md"
      >
        {fs ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        {fs ? "退出全屏" : "全屏演示"}
      </button>

      <div className={`mx-auto ${fs ? "max-w-[1400px]" : "max-w-[1280px]"} px-6 py-8 space-y-8`}>
        {/* ============== Slide 1 · 封面 ============== */}
        <Slide n="01" total="06" label="封面">
          <div className="relative h-full flex flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/25 via-card to-card px-16">
            <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative space-y-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-[13px] text-primary">
                <Sparkles className="h-4 w-4" /> 脱淘项目
              </span>
              <h1 className="text-[68px] font-bold leading-[1.1] tracking-tight">
                一次系统迁移，
                <br />
                一次<span className="text-primary">建立自主可控底座</span>的机会
              </h1>
              <div className="flex flex-wrap gap-4 text-[18px] text-foreground/75 pt-2">
                <span><b className="text-foreground">短期</b> · 依赖收敛</span>
                <span className="text-muted-foreground/40">／</span>
                <span><b className="text-foreground">中期</b> · 架构统一</span>
                <span className="text-muted-foreground/40">／</span>
                <span><b className="text-foreground">长期</b> · AI × 平台化</span>
              </div>
            </div>
          </div>
        </Slide>

        {/* ============== Slide 2 · 为什么是现在 ============== */}
        <Slide n="02" total="06" label="为什么是现在">
          <div className="h-full flex flex-col px-14 py-12">
            <SlideHeader eyebrow="WHY NOW" title="为什么必须现在做" />
            <div className="grid grid-cols-3 gap-6 flex-1 mt-10">
              <RiskCard
                icon={Unplug} tag="外部依赖" title="账号体系依托阿里"
                desc="国内 B 端账号、企业创建仍接入阿里体系，存在不确定性，需在可控时间内迁移。"
              />
              <RiskCard
                icon={AlertTriangle} tag="历史债务" title="十年迭代积累待整理"
                desc="老代码改造空间有限，新业务在老逻辑上扩展成本较高，系统观测能力不足。"
              />
              <RiskCard
                icon={Layers3} tag="资源效率" title="国内外多套并行"
                desc="同一模块重复开发，研发投入产出比有较大优化空间。"
              />
            </div>
            <div className="mt-8 rounded-lg border border-primary/30 bg-primary/5 px-6 py-4 text-[15px] leading-[1.8] text-foreground/90">
              <b className="text-primary">结论：</b>这三类问题难以通过"再迭代一版"逐步消化，
              脱淘是一次较为合适的、可以从底座系统性重构的窗口期。
            </div>
          </div>
        </Slide>

        {/* ============== Slide 3 · 核心设计 · 正交坐标系 ============== */}
        <Slide n="03" total="06" label="产品设计核心">
          <div className="h-full flex flex-col px-14 py-12 bg-gradient-to-br from-primary/8 via-card to-card">
            <SlideHeader eyebrow="CORE DESIGN" title="企业 × 产品 · 正交坐标系" />
            <p className="mt-5 text-[17px] leading-[1.8] text-foreground/85">
              新架构的核心是<b className="text-primary">两个维度的正交相交</b>：
              水平方向是<b>企业关系图</b>（品牌商 / 卖场 / 经销商 / 门店 / 供应商），
              垂直方向是<b>产品矩阵</b>（国内 3D / 国际 3D / AI 设计家 / VR 全景 …）。
              <br />
              <b className="text-primary">「企业 × 产品」是一切权益、订单、人员、客户的最小坐标点。</b>
            </p>

            <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-6 flex-1">
              {/* 矩阵 */}
              <div className="rounded-xl border bg-background/60 p-5">
                <div className="flex items-center gap-2 mb-3 text-[12px] font-mono uppercase tracking-wider text-muted-foreground">
                  <Grid3x3 className="h-3.5 w-3.5" /> Enterprise × Product Matrix
                </div>
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2.5 px-3 text-muted-foreground font-medium w-[110px]">企业 ＼ 产品</th>
                      {["国内 3D", "国际 3D", "AI 设计家", "VR 全景"].map(h => (
                        <th key={h} className="py-2.5 px-2 text-center text-primary font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["品牌商", "●", "●", "●", "○"],
                      ["卖场", "●", "●", "●", "●"],
                      ["经销商", "●", "—", "●", "—"],
                      ["门店", "●", "—", "○", "—"],
                    ].map(([role, ...cells]) => (
                      <tr key={role} className="border-b last:border-0">
                        <td className="py-2.5 px-3 font-medium text-foreground">{role}</td>
                        {cells.map((c, i) => (
                          <td key={i} className={`py-2.5 px-2 text-center text-[17px] ${
                            c === "●" ? "text-emerald-500" : c === "○" ? "text-amber-500" : "text-muted-foreground/40"
                          }`}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-muted-foreground">
                  <span><span className="text-emerald-500">●</span> 已开通</span>
                  <span><span className="text-amber-500">○</span> 可扩展</span>
                  <span><span className="text-muted-foreground/60">—</span> 不适用</span>
                </div>
              </div>

              {/* 价值 */}
              <div className="flex flex-col gap-3 justify-center">
                <ValueCard title="一套架构承接全部业务" desc="新增产品 / 新增企业形态，都是在同一张矩阵上扩展，无需新建系统。" />
                <ValueCard title="国内外天然统一" desc="国内 3D 与国际 3D 是同一矩阵的两列，差异通过配置承接。" />
                <ValueCard title="数据天然可治理" desc="所有业务都落到统一坐标，平台第一次具备跨企业、跨产品的数据视角。" />
              </div>
            </div>
          </div>
        </Slide>

        {/* ============== Slide 4 · 短期 ============== */}
        <StageSlide
          n="04" tone="emerald" phase="短期" time="0 – 6 个月"
          head="完成依赖收敛，跑通样板链路"
          points={[
            "国内版账号体系完成自主化，存量用户迁移 ≥ 95%",
            "选取 3D 工具作为脱淘样板，全链路在新架构上跑通",
            "借契机系统性清理约 80% 的废旧功能，重构企业 / 资产 / 权益 / 权限",
          ]}
          outcome="建立业务自主性与连续性保障"
          icon={ShieldAlert}
        />

        {/* ============== Slide 5 · 中期 ============== */}
        <StageSlide
          n="05" tone="primary" phase="中期" time="6 – 12 个月"
          head="一套架构承接所有产品线"
          points={[
            "国内 3D / 国际 3D / AI 设计家 / 精准营销 逐步接入新架构",
            "支持品牌商 / 卖场 / 经销商 / 装企 等差异化企业形态",
            "新功能上线周期从 N 周 → N 天",
          ]}
          outcome="重复开发收敛，企业级业务可独立报价"
          icon={Building2}
        />

        {/* ============== Slide 6 · 长期 + 结语 ============== */}
        <Slide n="06" total="06" label="长期与结语">
          <div className="h-full flex flex-col px-14 py-12 bg-gradient-to-br from-violet-500/10 via-card to-card">
            <div className="flex items-end justify-between border-b border-violet-500/20 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 mb-2">
                  <Calendar className="h-3 w-3 text-violet-500" />
                  <span className="text-[12px] font-semibold text-violet-500">长期</span>
                  <span className="text-[11px] text-violet-500/80">12 – 24 个月</span>
                </div>
                <h2 className="text-[28px] font-bold tracking-tight">从工具型产品 → AI × 平台型产品</h2>
              </div>
              <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground">LONG-TERM</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <LongCard icon={Sparkles} title="AI 化升级" desc="AI 辅助设计、智能推荐、数据预测落地。" />
              <LongCard icon={Layers3} title="平台化演进" desc="支持第三方与供应链生态接入，平台具备完整资产管理能力。" />
              <LongCard icon={TrendingUp} title="商业模式扩展" desc="基于统一底座，灵活配置会员 / SaaS / 增值服务。" />
            </div>

            <div className="mt-auto rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-7">
              <div className="flex items-start gap-4">
                <Target className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="text-[22px] leading-[1.5] text-foreground font-semibold">
                    <span className="text-primary">短期</span>建立自主底座 ·
                    <span className="text-primary"> 中期</span>优化成本结构 ·
                    <span className="text-primary"> 长期</span>撬动新增长曲线
                  </p>
                  <p className="text-[15px] leading-[1.85] text-foreground/80">
                    脱淘并非一次性的迁移动作，而是<b>未来三年战略动作的前置条件</b>。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Slide>
      </div>
    </div>
  );
}

/* ───────── 组件 ───────── */

function Slide({ n, total, label, children }: { n: string; total: string; label: string; children: React.ReactNode }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">SLIDE {n} / {total}</span>
        <span className="text-[12px] text-muted-foreground">{label}</span>
      </div>
      <div className="relative w-full aspect-[16/9] rounded-2xl border bg-card shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SlideHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between border-b pb-4">
      <h2 className="text-[32px] font-bold tracking-tight">{title}</h2>
      <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</span>
    </div>
  );
}

function RiskCard({ icon: Icon, tag, title, desc }: { icon: any; tag: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-muted/15 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-9 w-9 rounded-md bg-red-500/15 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-red-500" />
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-red-500">{tag}</span>
      </div>
      <div className="text-[18px] font-semibold text-foreground leading-[1.4]">{title}</div>
      <div className="mt-2 text-[14px] text-muted-foreground leading-[1.85]">{desc}</div>
    </div>
  );
}

function ValueCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <div className="text-[14.5px] font-semibold text-foreground leading-[1.4]">{title}</div>
          <div className="mt-1 text-[12.5px] text-foreground/75 leading-[1.75]">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function LongCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-l-4 border-l-violet-500 bg-muted/15 p-5">
      <Icon className="h-5 w-5 text-violet-500 mb-2" />
      <div className="text-[16px] font-semibold text-foreground leading-[1.4]">{title}</div>
      <div className="mt-1.5 text-[13px] text-muted-foreground leading-[1.85]">{desc}</div>
    </div>
  );
}

function StageSlide({
  n, tone, phase, time, head, points, outcome, icon: Icon,
}: {
  n: string; tone: "emerald" | "primary" | "violet";
  phase: string; time: string; head: string; points: string[]; outcome: string; icon: any;
}) {
  const map = {
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", grad: "from-emerald-500/12", dot: "bg-emerald-500", border: "border-emerald-500/20" },
    primary: { text: "text-primary", bg: "bg-primary/10", grad: "from-primary/12", dot: "bg-primary", border: "border-primary/20" },
    violet: { text: "text-violet-500", bg: "bg-violet-500/10", grad: "from-violet-500/12", dot: "bg-violet-500", border: "border-violet-500/20" },
  }[tone];
  return (
    <Slide n={n} total="06" label={`${phase}收益`}>
      <div className={`h-full flex flex-col px-14 py-12 bg-gradient-to-br ${map.grad} via-card to-card`}>
        <div className={`flex items-end justify-between border-b ${map.border} pb-4`}>
          <div>
            <div className={`inline-flex items-center gap-1.5 rounded-full ${map.bg} px-2.5 py-1 mb-2`}>
              <Calendar className={`h-3 w-3 ${map.text}`} />
              <span className={`text-[12px] font-semibold ${map.text}`}>{phase}</span>
              <span className={`text-[11px] ${map.text}/80`}>{time}</span>
            </div>
            <h2 className="text-[32px] font-bold tracking-tight">{head}</h2>
          </div>
          <Icon className={`h-12 w-12 ${map.text} opacity-50`} />
        </div>

        <ul className="mt-10 space-y-5 flex-1">
          {points.map((p, i) => (
            <li key={p} className="flex items-start gap-4">
              <span className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${map.bg} ${map.text} text-[14px] font-bold font-mono`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[19px] text-foreground/90 leading-[1.6]">{p}</span>
            </li>
          ))}
        </ul>

        <div className={`mt-6 rounded-xl border ${map.border} ${map.bg} px-6 py-4 flex items-center gap-3`}>
          <ArrowRight className={`h-5 w-5 ${map.text}`} />
          <span className={`text-[17px] font-semibold ${map.text}`}>{outcome}</span>
        </div>
      </div>
    </Slide>
  );
}
