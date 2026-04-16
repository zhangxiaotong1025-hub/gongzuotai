# Project Memory

## Core
React + Tailwind + Lucide React, Spring Boot backend. Dark mode admin style.
Brand context: "居然设计家" (Easyhome Design). Branches use "居然之家".
Mock-first dev strategy: build UI/UX with frontend mocks before backend integration.
Architecture: "Product is 1st permission dimension", "Platform as Enterprise".
Floor navigation Scroll-Spy MUST use `useRef<HTMLElement>` for `<section>`.
List actions: max 3 inline, right sticky via Portal. Confirm danger actions.
Components: AdminTable, FilterBar, Pagination, PageHeader, DetailActionBar.
Badges: rounded-full capsule, 1.5h solid dot indicator (info, success, danger).
Forms: Sectioned Card Layout, 100px label width (right aligned, wide=120px).
Business: Platform acquires leads → cleanses → distributes to enterprises. Revenue = lead sales.

## Memories
- [Project Context](mem://project/context) — Background: remodel Alibaba backend for home decor 3D design platform
- [Leads Pipeline](mem://features/leads-pipeline-business-model) — Platform lead acquisition→cleansing→distribution→enterprise feedback loop
- [Marketing System](mem://features/marketing-system-architecture) — 9-module intelligent marketing system: channels, campaigns, leads, calls, distribution, tracking, settlement, settings
- [Interaction Standards](mem://ui/interaction-standards) — Admin interaction patterns, wizard standard, editing is creating
- [Standard Components](mem://ui/standard-components) — AdminTable, FilterBar, Pagination, PageHeader usage
- [Visual Specification](mem://ui/visual-specification) — Dark mode hero, glassmorphism, useAnimatedValue, pulse animations
- [Form Layout Standards](mem://ui/form-layout-standards) — Sectioned Card Layout, 100px label width right-aligned
- [Badge System](mem://ui/badge-system-standard) — rounded-full capsules, 1.5h solid dot, semantic colors
- [Detail Action Bar](mem://ui/universal-detail-action-bar) — Detail page operations hub and Standard Dialog copy/edit
- [Complex Detail Layout](mem://ui/complex-detail-layout) — Info-graphics layout, 56px offset floor navigation, Tooltips
- [Portrait Interactions](mem://ui/customer-portrait-interaction-standard) — Customer portrait dialog: tooltip-first, sticky subnav
- [Backend Specification](mem://architecture/backend-specification) — DB schema, JWT auth with enterprise_id, PG RLS functions
- [Enterprise Structure](mem://features/enterprise-structure) — Enterprise-centric tree structure, multi-product isolation
- [Enterprise Management](mem://features/enterprise-management) — 6 enterprise types, state decoupling (business/audit), admin reqs
- [Hierarchy Management](mem://features/hierarchy-management) — 3-level org logic (HQ, Child, Grandchild) and restrictions
- [Audit System](mem://features/audit-system) — Audit timeline and cascade freezing for child enterprises
- [Enterprise Detail Hub](mem://features/enterprise-detail-hub) — Action center for enterprise editing and quick access
- [Enterprise Workflow](mem://features/enterprise-application-workflow) — Admission workflow, timeline, intention type adjustments
- [Staff Data Logic](mem://features/staff-data-logic) — Multi-org staff attribution, cascaded path display
- [Staff Layout](mem://features/staff-management-layout) — Eagle-like UI, sticky 220px tree, natural scrolling
- [Staff Actions](mem://features/staff-list-actions) — Visibility rules, confirmation for danger actions, inline config
- [Brand Relationship](mem://features/brand-relationship-logic) — Own/Agent permissions based on enterprise type
- [Brand Management](mem://features/brand-management) — 4-step wizard for independent brand creation
- [Org Structure](mem://features/org-structure-interaction) — Inline tree editing and node selections
- [Entitlement Architecture](mem://features/entitlement-management-architecture) — 4-layer: App -> Capability -> Rule -> SKU/Bundle
- [Entitlement Visuals](mem://ui/entitlement-visual-spec) — 5-color palette, >=80% warning bar, wide labels for complex configs
- [Transaction Logic](mem://features/entitlement-transaction-logic) — Order parsing, account tracing via sourceOrderIds
- [Entitlement Dashboard](mem://features/entitlement-dashboard) — BI dashboard, KPI, glassmorphism, health heatmaps
- [Selection Interaction](mem://features/entitlement-selection-interaction) — 2-level PickerDialog for massive data selections
- [Account Aggregation](mem://features/entitlement-account-aggregation) — Cross-app account aggregation, health warnings (>=80%)
- [Order Detail Structure](mem://features/entitlement-order-detail-structure) — 5-stage lifecycle graph, 6-module layout
- [Order Status Matrix](mem://features/order-status-matrix) — 3D decoupled: Audit, Payment, Lifecycle (no draft state)
- [Order Lifecycle UI](mem://features/order-lifecycle-ui) — Lifecycle nodes: Created, Audit, Payment, Active, End
- [Order Type Logic](mem://features/entitlement-order-type-logic) — enterprise_grant, internal_grant, user_purchase handling
- [Customer Health](mem://features/customer-health-analytics) — Score Ring, area charts, risk/opportunity detection
- [Customer Insights Engine](mem://features/customer-intelligence-engine) — Data-driven ops suggestions, confidence levels
- [Marketing ROI](mem://features/marketing-roi-analysis) — Conversion, referral, CAC tracking, segment preview
- [CRM BI Cockpit](mem://features/customer-crm-analytics-marketing) — Kanban lanes, lifecycle distribution, alerts
- [Portrait Dossier](mem://features/customer-portrait-narrative-dossier) — Dossier cards, 3-sentence narrative, Dos & Don'ts chips
- [Portrait Visuals](mem://features/customer-portrait-visual-modeling) — SVG active heatmaps, priority scatter grids
- [Dossier Layout](mem://features/customer-dossier-design) — 3:3:6 grid for health, radar, narrative info-graphics
- [Unified CRM Model](mem://features/customer-unified-crm-model) — Platform vs Enterprise perspectives, duplicate mapping
- [Permission Architecture](mem://features/permission-management-architecture) — Menu-Policy-Role architecture (platform/enterprise)
- [Permission Wizard](mem://ui/permission-creation-wizard) — Role/Menu step-by-step creation logic
- [Permission Cross-role](mem://features/permission-management-ui) — Cross-role menu visibility based on enterprise attributes
- [Policy Logic](mem://features/policy-management-logic) — Button/API/Data policy types tied to menus
- [Auth System](mem://features/auth-system-logic) — Multi-enterprise login, phone primary key, exit-only (no deletion)
- [Product Architecture](mem://features/model-product-product-hierarchy-standard) — SPU/SKU strict hierarchy for 3D models/products
- [Product Logic](mem://features/product-management-business-logic) — Supply vs Enterprise vs Private tabs, 1:N org distribution
- [Product Creation](mem://features/product-creation-interface) — High-density FormGrid, dynamic SKU attributes, media groups
