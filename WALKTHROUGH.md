# Buena Platform Walkthrough & Engineering Overview

This guide provides a structured walkthrough of the Buena Property Management Platform, detailing key features, architectural decisions, and the user flows implemented to professionalize the experience.

---

## 1. Project Overview & Architecture
Buena is built as a **Monorepo** to ensure tight coupling between the frontend, backend, and shared business logic.

- **Frontend**: Next.js (App Router), Lucide Icons, Vanilla CSS Modules (for performance and precision).
- **Backend**: NestJS, Prisma ORM, PostgreSQL.
- **Shared**: A shared types package ensuring end-to-end type safety between the API and the UI.
- **AI Engine**: Integrated OpenAI services for automated document extraction and portfolio summaries.

---

## 2. Key decision-making & UI/UX Strategy
Our primary goal was to move from a prototype feel to an **enterprise-grade platform**.

- **Iconography**: Replaced generic emojis with Lucide-React vector icons. This immediately elevated the "seriousness" of the tool.
- **Theming**: Implemented a theme-aware system (Light/Dark mode) using HSL CSS variables, ensuring high contrast and accessibility.
- **Branding**: Synchronized the sidebar aesthetics with the logo. We used an Indigo-to-Violet gradient as a primary brand marker to provide a cohesive visual anchor.
- **Robustness**: Implemented `suppressHydrationWarning` and defensive coding patterns to handle external browser extensions and asynchronous data loading without UI crashes.

---

## 3. Main User Flows

### A. The Property Wizard
Instead of a complex single-form approach, we implemented a **multi-step wizard** for property creation.
- **General Info**: Basic property metadata.
- **Building Setup**: Grouping units logically.
- **Units**: Granular control over apartment/commercial spaces.

### B. Tenant & Lease Lifecycle
- **Tenant CRM**: A central place to manage residents.
- **Dynamic Connection**: We built a flow to link tenants to specific units via active leases, tracking rent and security deposits in real-time.
- **Tenant Profiles**: Visualizing a tenant's history and current status at a glance.

### C. Financial Ledger (CRUD)
- **Unified Ledger**: Tracks Revenue vs. Expenses across the entire portfolio.
- **CRUD Operations**: Users can now Add, Edit, and Delete transactions with immediate updates to the Portfolio Metrics cards.
- **P&L Tracking**: Real-time calculation of Net Profit to give property managers instant financial health checks.

### D. Advanced Reporting & AI Insights
- **Data Visualization**: Custom distribution charts for Unit Types, Management Structures, and Financial Performance.
- **AI Summary**: A unique feature that reads the portfolio data and provides a natural-language "Executive Summary." It identifies trends (like occupancy peaks or expense spikes) automatically.

---

## 4. Engineering "Efficiency" Wins
- **API Client**: Auto-generated/Typed client based on Swagger, reducing integration bugs.
- **Prisma Migrations**: Documented schema changes for Tenants, Leases, and Finances.
- **Consolidated Workspace**: All apps and packages are managed under one roof, making CI/CD and local development significantly faster.

---

## 5. Next Steps
- **Document Management**: Expanding the current document kind tracking into a full version-controlled storage system.
- **Bulk Import**: Enhancing the AI extraction service to handle large PDF batches for rapid onboarding.
