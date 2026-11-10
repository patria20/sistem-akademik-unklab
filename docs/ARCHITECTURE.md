# ARCHITECTURE SPECIFICATION — SIAM-UNKLAB
## Sistem Informasi Akademik dan Manajemen Studi Universitas Klabat
**Version:** 1.0.0-PROTOTYPE  
**Standard:** Enterprise Academic System Architecture  

---

## 1. High-Level Architecture Overview

SIAM-UNKLAB is designed with a modular, clean, and layered architecture that decouples UI components, business validation rules, state management, and mock academic services.

```
+-------------------------------------------------------------------------+
|                              PRESENTATION LAYER                         |
|  - Role-based Shell Layouts (TailAdmin React)                           |
|  - Student Portal (/student/*)                                          |
|  - Lecturer Portal (/lecturer/*)                                        |
|  - Administrator Portal (/admin/*)                                      |
|  - Common Design Tokens (UNKLAB Navy #142B4A, Blue #2563EB, Slate)      |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                     INTERACTION & APPLICATION LAYER                     |
|  - Navigation & Role Guard (React Router v7/v8)                         |
|  - Auth & Session Context (User, Active Role, Switcher)                 |
|  - Academic Notification Bus (Actionable toasts & notification center)  |
|  - Modal & Dialog Controller (Radix / TailAdmin Dialog)                 |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  CORE ACADEMIC DOMAIN ENGINE (Deterministic)            |
|  - AcademicValidationEngine:                                            |
|      * calculateTotalCredits()                                          |
|      * checkPrerequisite()                                              |
|      * validateScheduleConflict()                                       |
|      * validateCreditLimit()                                            |
|      * validateClassCapacity()                                          |
|      * validateCurriculum()                                             |
|      * checkRepeatedCourse()                                            |
|  - GPACalculator:                                                       |
|      * calculateSemesterGPA()                                           |
|      * calculateCumulativeGPA()                                         |
|      * calculateAcademicProgress()                                      |
|  - DemandForecastingEngine:                                             |
|      * calculateRequiredClasses(studentDemand, capacity) = CEIL(N/C)    |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                           SERVICE LAYER                                 |
|  - authService.ts        - studentService.ts     - lecturerService.ts   |
|  - krsService.ts         - courseService.ts      - gradeService.ts      |
|  - attendanceService.ts  - consultationService.ts - aiAcademicService.ts|
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                       DATA REPOSITORY LAYER                             |
|  - Unified Single Source of Truth (Mock Storage / In-Memory / Local)    |
|  - Synchronized Entity Relations (Students, Courses, Classes, KRS, etc) |
+-------------------------------------------------------------------------+
```

---

## 2. Technology Stack & Integration Rationale

| Layer / Concern | Chosen Technology | Selected Source | Technical Rationale |
|---|---|---|---|
| **Base Framework** | React 19 + TypeScript | TailAdmin / React 19 | Standard modern React with strict typing. |
| **Bundler & Tooling** | Vite 6 / 8 + Tailwind CSS v4 | TailAdmin React | Blazing-fast HMR and compile speeds with modern Tailwind v4 theme directives. |
| **Foundation Layout** | TailAdmin React Layout | TailAdmin | Clean sidebar drawer, responsive header, breadcrumb, theme support. |
| **Interactive Modals** | TailAdmin UI + Radix UI pattern | TailAdmin / shadcn | High accessibility (ARIA), clean focus trapping, backdrop blur. |
| **Charts & Visuals** | Recharts & ApexCharts | PRD Requirement / TailAdmin | Declarative responsive charts for GPA trend, SKS distribution, attendance. |
| **Icons** | Lucide React | PRD Requirement | Comprehensive, consistent, lightweight academic & admin icon set. |
| **Routing** | React Router (`react-router`) | TailAdmin | Declarative nested layout routes with role-based Route Guards. |
| **Form & Validation** | React Hook Form + Zod | TailAdmin / shadcn | Zero-runtime-overhead controlled and uncontrolled form bindings. |

---

## 3. Security & Boundary Architecture

1. **Role-Based Access Control (RBAC):**
   - Protected routes check `authContext.user.role`.
   - Unauthorized attempts redirect to `/unauthorized` or `/login`.
2. **Deterministic Academic Rules (No AI hallucination):**
   - AI service is purely advisory.
   - All enrollment permissions, prerequisite checking, credit ceilings, and schedule collisions are evaluated deterministically by `academicValidator.ts`.
3. **Simulation Boundary Disclaimer:**
   - Every view displaying simulated data carries the required notice `[DATA SIMULASI]` to ensure production fidelity distinction.
