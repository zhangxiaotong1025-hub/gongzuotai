---
name: Merchant-side Business Modules
description: 6-module merchant workbench completing the platform↔merchant closed loop beyond lead reselling
type: feature
---
## 6 Modules (route prefix /merchant/*)
1. 商家工作台 `/merchant` — KPIs, credit level, today's tasks, conversion funnel, AI coach
2. 我的客资 `/merchant/leads` — Received leads with status machine, follow-up timeline, AI suggestions
3. 签单管理 `/merchant/deals` — Deal pipeline (opportunity→quoted→signed→started), revenue tracking
4. 项目交付 `/merchant/projects` — 8-milestone project cards (量房→验收), overdue alerts
5. 客户评价 `/merchant/reviews` — 4-dimension scoring, merchant grade (S/A/B/C/D), grade→dispatch weight
6. 老客运营 `/merchant/retention` — Post-completion pool, referral incentives, repurchase opportunities

## Data Layer
- `src/data/merchant.ts` — All mock data for merchant modules

## Flywheel Logic
Merchant uses tools → Data flows to platform → Platform leads more precise → Higher conversion → More tool usage

## Grade Impact
- S/A: Priority high-quality leads + discount pricing
- B: Normal dispatch, standard pricing  
- C/D: Limited dispatch, requires improvement
