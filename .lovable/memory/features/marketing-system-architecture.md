---
name: Marketing System Architecture
description: Independent 9-module intelligent marketing system covering lead acquisition to settlement with AI automation
type: feature
---
## 9 Modules (route prefix /marketing/*)
1. 营销驾驶舱 `/marketing` — Pipeline funnel, KPIs, health scores, AI roadmap
2. 渠道管理 `/marketing/channels` — Channel ROI, budget optimizer, mini charts
3. 活动管理 `/marketing/campaigns` — Campaign lifecycle, attribution, budget tracking
4. 线索池 `/marketing/leads` — Full lead list, status machine (raw→qualified→distributed), AI scoring
5. 呼叫中心 `/marketing/call-center` — AI vs human comparison, call records, agent workbench
6. 智能派发 `/marketing/distribution` — Matching engine (5 weighted dimensions), enterprise profiles
7. 跟进追踪 `/marketing/tracking` — Kanban board (7 stages), overdue alerts, incentive mechanisms
8. 结算中心 `/marketing/settlement` — CPA/CPS billing, deposits, deductions
9. 运营配置 `/marketing/settings` — Scoring model, distribution rules, incentive config

## Data Layer
- `src/data/marketing.ts` — All mock data for the marketing system
- `src/data/agent-leads-pipeline.ts` — Shared pipeline/enterprise data

## Lead Status Machine
raw → pending_cleanse → cleansing → qualified/unqualified → pending_distribute → distributed → contacted → converted/lost

## AI Capabilities
- AI outbound calling (70% AI + 30% human)
- Multi-dimensional intent scoring (5 dimensions, configurable weights)
- Smart matching engine (region + category + conversion + feedback + capacity)
- Dynamic pricing (¥120-400 based on quality tiers)
