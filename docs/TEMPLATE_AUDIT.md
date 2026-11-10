# Template Audit — SIAM-UNKLAB

**Date:** 2026-11-09  
**Auditor:** SIAM-UNKLAB Development Team  
**Purpose:** Evaluate all four provided templates before integration into the final SIAM-UNKLAB application.

---

## 1. TailAdmin React (PRIMARY FOUNDATION)

### Technology Stack
| Property | Value |
|---|---|
| Package Name | `tailadmin-react` v2.5.0 |
| React Version | ^19.2.8 |
| Vite Version | ^8.3.0 |
| TypeScript | ~6.0.2 |
| Tailwind CSS | ^4.3.3 (via `@tailwindcss/vite`) |
| Routing | `react-router` ^8.4.0 |
| Forms | `react-hook-form` ^7.89.0 + `zod` ^3.25.76 |
| Charts | `react-apexcharts` / `apexcharts` ^7.8.0 |
| Tables | `@tanstack/react-table` ^9.2.8 |
| Calendar | `@fullcalendar/react` ^7.1.1 |
| Icons | Custom icon system (from `/src/icons`) |
| Maps | `leaflet`, `maplibre-gl`, `react-map-gl` |
| Internationalization | `i18next` ^26.4.2 |
| Drag & Drop | `react-dnd` ^16.0.1 |
| License | **MIT** ✅ |

### Source Folder Structure
```
src/
├── assets/
├── components/
│   ├── layout/
│   │   └── app-layout/
│   │       ├── header/
│   │       │   └── index.tsx
│   │       ├── sidebar/
│   │       │   ├── data.tsx       (nav items)
│   │       │   ├── index.tsx      (sidebar root)
│   │       │   ├── sidebar-header.tsx
│   │       │   ├── sidebar-menu-item.tsx
│   │       │   ├── sidebar-nav-group.tsx
│   │       │   ├── sidebar-submenu-item.tsx
│   │       │   ├── sidebar-widget.tsx
│   │       │   └── types.ts
│   │       └── index.tsx          (AppLayout)
│   ├── shared/
│   └── ui/
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── dropdown.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── sidebar.tsx            (shadcn-compatible SidebarProvider)
│       ├── skeleton.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── tooltip.tsx
│       └── ...many more
├── contexts/
├── hooks/
├── icons/
├── i18n/
├── pages/
│   ├── main/
│   │   ├── calendar/
│   │   ├── dashboard/
│   │   │   └── ecommerce/
│   │   ├── forms/
│   │   ├── pages/
│   │   ├── profile/
│   │   └── tables/
│   └── others/
│       ├── auth/
│       ├── charts/
│       └── ui-elements/
├── utils/
├── App.tsx
├── index.css      (Tailwind v4 theme + design tokens)
└── main.tsx
```

### Best Components
| Component | Location | Quality |
|---|---|---|
| AppLayout | `components/layout/app-layout/index.tsx` | ⭐⭐⭐⭐⭐ |
| Sidebar | `components/layout/app-layout/sidebar/` | ⭐⭐⭐⭐⭐ |
| Header | `components/layout/app-layout/header/` | ⭐⭐⭐⭐⭐ |
| SidebarProvider | `components/ui/sidebar.tsx` | ⭐⭐⭐⭐⭐ |
| Button | `components/ui/button.tsx` | ⭐⭐⭐⭐⭐ |
| Badge | `components/ui/badge.tsx` | ⭐⭐⭐⭐⭐ |
| Card | `components/ui/card.tsx` | ⭐⭐⭐⭐⭐ |
| Dialog | `components/ui/dialog.tsx` | ⭐⭐⭐⭐⭐ |
| Table | `components/ui/table.tsx` | ⭐⭐⭐⭐ |
| Tabs | `components/ui/tabs.tsx` | ⭐⭐⭐⭐⭐ |
| Pagination | `components/ui/pagination.tsx` | ⭐⭐⭐⭐ |
| Alert | `components/ui/alert.tsx` | ⭐⭐⭐⭐⭐ |
| Skeleton | `components/ui/skeleton.tsx` | ⭐⭐⭐⭐ |

### Design System
- **Font:** Outfit (Google Fonts)
- **Color tokens:** `--color-brand-*`, using CSS custom properties
- **Shadow system:** `--shadow-theme-*` variants
- **Tailwind v4** CSS-based configuration (no `tailwind.config.js`)

### Decision
✅ **USE AS PRIMARY FOUNDATION** — Copy entire source structure into SIAM-UNKLAB and modify.

---

## 2. shadcn-admin (SECONDARY — COMPONENT PATTERNS)

### Technology Stack
| Property | Value |
|---|---|
| Package Name | `shadcn-admin` v2.2.1 |
| React Version | ^19.2.5 |
| Vite Version | ^8.0.8 |
| TypeScript | ~6.0.3 |
| Tailwind CSS | ^4.2.2 |
| Routing | `@tanstack/react-router` ^1.168.22 |
| State | `zustand` ^5.0.12 |
| Forms | `react-hook-form` + `zod` |
| Charts | `recharts` ^3.8.1 |
| Tables | `@tanstack/react-table` ^8.21.3 |
| Auth | `@clerk/react` (external) |
| Data Fetching | `@tanstack/react-query` |
| Toast | `sonner` ^2.0.7 |
| Command | `cmdk` 1.1.1 |
| License | **MIT** ✅ |

### Best Components for Extraction
| Component | File | Extract Decision |
|---|---|---|
| ConfirmDialog | `components/confirm-dialog.tsx` | ✅ Extract & adapt |
| CommandMenu | `components/command-menu.tsx` | ✅ Extract & adapt |
| ProfileDropdown | `components/profile-dropdown.tsx` | ✅ Pattern reference |
| Search | `components/search.tsx` | ✅ Pattern reference |
| PasswordInput | `components/password-input.tsx` | ✅ Extract |
| DatePicker | `components/date-picker.tsx` | ✅ Extract |
| ConfigDrawer | `components/config-drawer.tsx` | ⚠️ Evaluate |
| DataTable | `components/data-table/` | ✅ Pattern reference |
| Dashboard feature | `features/dashboard/` | ✅ Pattern reference |
| Auth feature | `features/auth/` | ✅ Pattern reference |

### Routing Conflict
- Uses `@tanstack/react-router` ≠ TailAdmin's `react-router`
- **Decision:** Use `react-router` (TailAdmin's routing system). Do NOT mix routing systems.
- Extract component UI patterns only, not routing patterns.

### Auth Conflict
- Uses `@clerk/react` (external auth service)
- **Decision:** Use custom auth context with mock service. Do NOT install @clerk.

### Decision
⚠️ **SELECTIVE EXTRACTION ONLY** — Extract specific component patterns. Do not install shadcn-admin dependencies wholesale.

---

## 3. Kiaalap (REFERENCE — UI PATTERNS)

### Technology Stack
| Property | Value |
|---|---|
| Package Name | `kiaalap` v4.0.0 |
| Type | **Static HTML + Bootstrap 5** (not React) |
| Bootstrap | ^5.3.8 |
| Chart | chart.js ^4.5.1 |
| Calendar | fullcalendar ^7.1.2 |
| Tables | simple-datatables |
| Vite | ^8.3.4 (HTML bundler, not React) |
| License | **MIT** ✅ |

### Academic-Specific Pages Available
- `index.html` — Education dashboard
- `index-1.html` — Alternative dashboard
- `all-students.html` — Student list
- `all-professors.html` — Professor list
- `all-courses.html` — Course list
- `add-student.html` — Add student form
- `add-professor.html` — Add professor form
- `add-course.html` — Add course form
- `student-profile.html` — Student profile
- `professor-profile.html` — Professor profile
- `course-info.html` — Course information
- `departments.html` — Department management
- `analytics.html` — Analytics dashboard
- `events.html` — Events
- `library-assets.html` — Library

### Critical Issue
🚨 **Framework mismatch** — Kiaalap is Bootstrap 5 HTML template. It CANNOT be directly imported into a React+Tailwind project.

### Decision
📐 **DESIGN INSPIRATION ONLY** — Use as visual reference for:
- Academic page layouts (dashboard, student/professor lists, course cards)
- Data presentation patterns
- Form field arrangements
- Statistical widget designs
Translate design patterns into React+Tailwind components manually.

---

## 4. Material UI (REFERENCE — COMPLEX COMPONENTS)

### Technology Stack
| Property | Value |
|---|---|
| Package | Material UI monorepo (source code) |
| Type | **Source repository** (not an installable template) |
| Framework | React + Emotion/styled-components |
| License | **MIT** ✅ |

### Critical Issue
🚨 **This is MUI's own source code monorepo** — not a usable app template. It contains:
- Package source code
- Documentation
- Tests
- Build scripts

### Decision
📦 **DO NOT INSTALL FROM THIS DIRECTORY** — Instead, install specific MUI packages from npm only if needed:
- `@mui/x-date-pickers` — if needed for date selection
- Preference: Use TailAdmin's existing `flatpickr` date picker instead
- Use MUI component documentation as reference for accessibility patterns

---

## Conflict Matrix

| Conflict | Templates | Resolution |
|---|---|---|
| Routing system | TailAdmin (react-router) vs shadcn (tanstack-router) | Use react-router |
| CSS framework | Tailwind (TA, shadcn) vs Bootstrap (Kiaalap) | Use Tailwind only |
| Auth system | TailAdmin (custom) vs shadcn (Clerk) | Custom auth context |
| Tailwind version | TA v4.3 vs shadcn v4.2 | Use v4.3+ |
| Chart library | ApexCharts (TA) vs recharts (shadcn) vs chart.js (kiaalap) | Use recharts (PRD requirement) |
| Icon system | TailAdmin custom vs shadcn radix-icons vs MUI icons | Use lucide-react (PRD) |
| State mgmt | Zustand (shadcn) vs Context (TailAdmin) | React Context + hooks |

---

## Final Decision Summary

| Template | Role | Usage Level |
|---|---|---|
| TailAdmin React | **Primary Foundation** | 80% of codebase |
| shadcn-admin | **Component Patterns** | 15% — selective extraction |
| Kiaalap | **Design Reference** | 5% — visual inspiration |
| Material UI | **Documentation Reference** | 0% — accessibility patterns only |
