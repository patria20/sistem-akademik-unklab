# IMPLEMENTATION PLAN — SIAM-UNKLAB
## Phase-by-Phase Roadmap and Milestones

---

## Phase 1: Project Discovery & Architecture Documentation (COMPLETED)
- [x] Audit all 4 templates (`TailAdmin`, `shadcn-admin`, `Kiaalap`, `Material UI`).
- [x] Identify technology stacks, licenses, and compatibility matrix.
- [x] Formulate template integration decisions.
- [x] Create `docs/TEMPLATE_AUDIT.md`.
- [x] Create `docs/COMPONENT_MAPPING.md`.
- [x] Create `docs/ARCHITECTURE.md`.
- [x] Create `docs/DATABASE_DESIGN.md`.
- [x] Establish unified folder and modular hierarchy.

---

## Phase 2: Foundation & Base Design System
- [ ] Initialize repository structure with TailAdmin foundation.
- [ ] Configure UNKLAB brand design tokens in Tailwind (Primary Navy `#142B4A`, Blue `#2563EB`, background `#F5F7FB`, status colors).
- [ ] Build global layout system:
  - AppLayout (Desktop sidebar + Mobile drawer).
  - Header (Breadcrumb, Search, Role Badge, Notifications Dropdown, Profile Dropdown).
  - Sidebar (Dynamic navigation links filtered by active role: Student, Lecturer, Admin).
- [ ] Setup Mock Authentication & Session Management with Demo Accounts:
  - Student: `mahasiswa@unklab.ac.id` / `student123`
  - Lecturer: `dosen@unklab.ac.id` / `dosen123`
  - Admin: `admin@unklab.ac.id` / `admin123`
- [ ] Setup Role-based Protected Route Guards and Error Views (`/login`, `/unauthorized`, `/not-found`).

---

## Phase 3: Student Module
- [ ] **Student Dashboard (`/student/dashboard`):**
  - Academic summary cards (IP Semester, IPK, SKS Lulus, SKS Ditempuh, Status KRS).
  - GPA trend chart (Recharts Line/Area).
  - Upcoming class schedule card.
  - Quick action to KRS Builder and AI Assistant.
- [ ] **KRS Builder (`/student/study-plan`):**
  - Filterable course catalog (by semester, department, search keyword).
  - Dynamic enrollment basket.
  - Live summary panel with deterministic validation engine:
    - Prerequisite checks with detailed feedback on unsatisfied prior courses.
    - Schedule clash detection (day & hour overlap).
    - Credit cap rule verification (based on previous semester GPA).
    - Class capacity limits.
  - Save as Draft & Submit to Academic Advisor with confirmation modal.
- [ ] **Academic Progress & Grades (`/student/academic-progress`, `/student/grades`):**
  - Complete curriculum checklist, progress bar, grade history per semester.
- [ ] **Schedule & Attendance (`/student/schedule`, `/student/attendance`):**
  - Weekly timetable matrix.
  - Attendance log with percentage and correction submission form.
- [ ] **Academic Consultation (`/student/consultation`):**
  - Threaded consultation request form to Academic Advisor (Dosen PA).

---

## Phase 4: Lecturer Module
- [ ] **Lecturer Dashboard (`/lecturer/dashboard`):**
  - Class load overview, assigned advisees, pending KRS review counter.
- [ ] **KRS Approval Workspace (`/lecturer/krs-approval`):**
  - Advisee student list with submission status (Draft, Submitted, Approved, Revision).
  - Detail inspection view with automated validation report and student notes.
  - Action buttons: Approve with notes, Request Revision, or Reject.
- [ ] **Class Management & Grading (`/lecturer/classes`, `/lecturer/grades`):**
  - Class lists, enrolled rosters, input grade modal with auto quality point calculation.
- [ ] **Attendance Verification (`/lecturer/attendance`):**
  - Session tracker and student attendance correction approval workflow.
- [ ] **Student Consultations (`/lecturer/consultation`):**
  - Advisee appointment requests, reply modal, and status updates.

---

## Phase 5: Admin / Academic Management Module
- [ ] **Admin Dashboard (`/admin/dashboard`):**
  - Enterprise metrics (Total Students, Lecturers, Active Courses, Classes, Pending Approvals).
- [ ] **Course Demand Analyzer (`/admin/reports` & demand widget):**
  - Class shortage forecast based on student enrollment: `CEILING(demand / capacity)`.
  - Comparison between Draft vs Submitted vs Approved demand.
- [ ] **Master Data Management (`/admin/courses`, `/admin/classes`, `/admin/curriculums`):**
  - Course catalog with prerequisite graph definitions.
  - Class section builder (lecturer assignment, room, day, time slots, quota).
- [ ] **Audit Trail & System Logs (`/admin/audit-logs`):**
  - Chronological activity log for KRS submissions, approvals, and grade entries.

---

## Phase 6: AI Academic Assistant Module
- [ ] **AI Assistant Interface (`/student/ai-assistant` & overlay drawer):**
  - Conversational interface with context awareness of logged-in student's SKS, GPA, and curriculum.
  - Academic Advisor persona: recommends optimal courses for next semester based on student progress.
  - Clear `[SIMULASI AI ACADEMIC SERVICE]` tag.
  - Deterministic guardrails: AI does not mutate official database records.

---

## Phase 7: Supporting Workflows & Notification Center
- [ ] Global notification dropdown reflecting real-time state changes (KRS approval updates, consultation replies, attendance updates).
- [ ] Complete responsive adaptation (Mobile drawer, stacked tables, touch-friendly targets).

---

## Phase 8: Quality Assurance & Build Verification
- [ ] Full end-to-end user scenario testing (Student submits KRS -> Lecturer approves -> Admin monitors demand).
- [ ] Validate zero horizontal overflow on mobile viewports.
- [ ] Production build verification (`npm run build`).
