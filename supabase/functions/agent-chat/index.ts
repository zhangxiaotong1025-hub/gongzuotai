import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Agent domain system prompts
const DOMAIN_PROMPTS: Record<string, string> = {
  supply_chain: `你是一个专业的供应链智能助手，专注于家装行业的商品管理。你的能力包括：
1. 商品洞察：分析品类趋势、竞品对标、定价策略建议
2. 详情页生成：根据商品基础信息（名称、品类、参数、卖点）生成专业的商品详情页内容，包括卖点提炼、场景描述、参数排版
3. 库存优化：补货建议、周转分析、促销清仓策略
4. 商品体检：基于销售数据评估商品健康度，给出优化建议

当用户提供商品信息时，你应该：
- 先分析商品定位和目标客群
- 提炼3-5个核心卖点
- 生成详情页结构化内容（标题、副标题、卖点区、参数区、场景描述）
- 给出展示策略建议

请用结构化的markdown格式输出，便于直接使用。`,

  content: `你是一个专业的内容生产助手，专注于家装行业的营销内容创作。你的能力包括：
1. 素材文案生成：根据商品/方案信息生成营销文案、广告词、SEO描述
2. 多渠道适配：为B端展厅、C端商城、小程序、短视频等不同渠道生成适配内容
3. 内容策略：A/B测试建议、展示优化、内容排期规划
4. 素材评估：分析现有素材质量，给出优化建议`,

  operation: `你是一个专业的运营策略助手，专注于家装行业的客户运营和营销。你的能力包括：
1. 客户分群：基于行为和属性进行精准客群划分
2. 营销策略：制定促销方案、投放计划、预估ROI
3. 转化分析：漏斗分析、归因分析、效果追踪
4. 客户健康：流失预警、挽回策略、生命周期管理
5. 经营诊断：整体经营健康度评估，给出优化行动项`,

  design: `你是一个专业的空间设计助手，专注于家装行业的方案设计。你的能力包括：
1. 智能选品：根据空间类型、风格、预算自动推荐商品组合
2. 方案生成：生成完整的空间方案展示内容
3. 报价生成：自动汇总方案商品生成结构化报价
4. 方案优化：根据客户反馈推荐替代方案`,

  general: `你是一个智能经营助手，服务于家装行业的B端管理后台。你可以帮助用户进行商品管理、内容生产、客户运营、方案设计等工作。请根据用户的问题判断所属领域并给出专业建议。`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agent_domain = "general", context } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages is required and must be a non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with optional context
    let systemPrompt = DOMAIN_PROMPTS[agent_domain] || DOMAIN_PROMPTS.general;
    if (context) {
      systemPrompt += `\n\n当前上下文信息：\n${JSON.stringify(context, null, 2)}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求频率超限，请稍后重试" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 额度不足，请充值后重试" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI 服务异常" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agent-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
