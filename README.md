# ProcureFlow

ProcureFlow is a portfolio-grade procurement and inventory operations platform. It replaces disconnected spreadsheets and approval messages with one traceable workflow for requests, suppliers, orders, stock and budgets.

## Current milestone

- Responsive enterprise dashboard
- Demo authentication and protected routing
- Role-ready user model powered by Zustand
- TanStack Query server-state layer with realistic async mock API
- Purchase-request list, live search and business status system
- Validated multi-line purchase request creation
- Dynamic approval routing based on request value
- Request details, approval notes and immutable-style activity timeline
- Approve/reject mutations with targeted cache updates
- Supplier onboarding with compliance-review status
- Searchable supplier directory and performance scorecards
- Commercial quotation comparison with best-value indicators
- Quotation selection mutation that resolves competing responses
- Purchase-order generation from selected quotations
- Order lifecycle tracking from issue through receipt
- Partial-delivery progress at order and line-item level
- Goods-receipt notes, inspection condition and delivery references
- Over-receipt protection and automatic order status transitions
- Multi-warehouse inventory catalogue and valuation
- Stock health distribution and reorder alerts
- Item-level stock movement ledger with source references
- Positive and negative adjustments with below-zero protection
- Goods receipts automatically create inventory movements
- Department budget allocation, commitment and actual-spend tracking
- Budget risk states and utilisation analytics
- Filterable organisation-wide spending report
- Browser-generated CSV exports
- Searchable audit log with actors, roles, entities and metadata
- Role-based navigation and direct-route permission guards
- Route-level lazy loading and recoverable error boundary
- Keyboard focus, skip navigation and reduced-motion support
- Vitest coverage for permissions and core business rules
- ESLint quality gate and production code splitting
- Administrator configuration for organisation identity and regional defaults
- Procurement prefixes, payment terms, receiving warehouse and workflow toggles
- Validated multi-level approval thresholds
- Configurable operational email notifications and daily digest
- Spend analytics, category allocation and responsive tables
- Loading, empty and hover states

## Stack

React, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, React Router, Recharts, Lucide React.

## Run locally

```bash
npm install
npm run dev
```

The demo signs in as a Procurement Officer. The mock service is intentionally separated from client state so it can later be replaced by a REST API without rewriting the UI.

## Roadmap

The current release is portfolio-ready. Recommended next work is connecting the mock service contract to a persistent backend and adding end-to-end browser tests.
