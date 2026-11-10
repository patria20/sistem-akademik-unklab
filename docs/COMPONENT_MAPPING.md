# Component Mapping — SIAM-UNKLAB

**Date:** 2026-11-09  
**Version:** 1.0  
**Purpose:** Maps each source component to its final SIAM-UNKLAB target.

---

## Layout Components

| Component | Source | Decision | Notes |
|---|---|---|---|
| AppLayout | TailAdmin | ✅ Use & modify | Add role-based layout variants |
| AppSidebar | TailAdmin | ✅ Use & modify | Replace nav items with academic menus per role |
| AppHeader | TailAdmin | ✅ Use & modify | Add notification bell, user role badge |
| SidebarProvider | TailAdmin ui/sidebar.tsx | ✅ Use as-is | Core layout provider |
| SidebarInset | TailAdmin ui/sidebar.tsx | ✅ Use as-is | Main content area |
| AuthLayout | TailAdmin | ✅ Use & modify | Add UNKLAB branding |
| PageHeader | Custom | 🆕 Create new | Breadcrumb + page title + actions |
| Breadcrumb | TailAdmin ui/breadcrumb.tsx | ✅ Use & extend | Academic path context |

---

## Base UI Components

| Component | Source | Decision | Notes |
|---|---|---|---|
| Button | TailAdmin ui/button.tsx | ✅ Use as-is | Standard variants available |
| Badge | TailAdmin ui/badge.tsx | ✅ Use & extend | Add academic status variants |
| Card | TailAdmin ui/card.tsx | ✅ Use as-is | Good card structure |
| Alert | TailAdmin ui/alert.tsx | ✅ Use & extend | Academic notification variants |
| Dialog | TailAdmin ui/dialog.tsx | ✅ Use as-is | Accessible modal |
| Sheet | TailAdmin ui/sheet.tsx | ✅ Use as-is | Slide-out drawer |
| Tabs | TailAdmin ui/tabs.tsx | ✅ Use as-is | Good for multi-section pages |
| Table | TailAdmin ui/table.tsx | ✅ Use & extend | Base table structure |
| Pagination | TailAdmin ui/pagination.tsx | ✅ Use as-is | Standard pagination |
| Select | TailAdmin ui/select.tsx | ✅ Use as-is | Form select |
| Input | TailAdmin ui/input.tsx | ✅ Use as-is | Standard input |
| Textarea | TailAdmin ui/textarea.tsx | ✅ Use as-is | Multi-line input |
| Checkbox | TailAdmin ui/checkbox.tsx | ✅ Use as-is | Form checkbox |
| RadioGroup | TailAdmin ui/radio-group.tsx | ✅ Use as-is | Form radio buttons |
| Tooltip | TailAdmin ui/tooltip.tsx | ✅ Use as-is | Hover tooltips |
| Popover | TailAdmin ui/popover.tsx | ✅ Use as-is | Floating content |
| Skeleton | TailAdmin ui/skeleton.tsx | ✅ Use as-is | Loading states |
| Avatar | TailAdmin ui/avatar.tsx | ✅ Use as-is | User photos |
| Separator | TailAdmin ui/separator.tsx | ✅ Use as-is | Dividers |
| DropdownMenu | TailAdmin ui/dropdown.tsx | ✅ Use as-is | Context menus |
| Collapsible | TailAdmin ui/collapsible.tsx | ✅ Use as-is | Expandable sections |
| ScrollArea | TailAdmin ui/scroll-area.tsx | ✅ Use as-is | Custom scrollbar |

---

## Composite Components

| Component | Source | Decision | Notes |
|---|---|---|---|
| ConfirmDialog | shadcn-admin pattern | ✅ Adapt pattern | Build with TailAdmin dialog |
| CommandMenu | shadcn-admin pattern | ✅ Adapt pattern | Quick navigation |
| PasswordInput | shadcn-admin pattern | ✅ Adapt pattern | Eye toggle |
| DatePicker | TailAdmin flatpickr | ✅ Use as-is | Date selection |
| DataTable | TailAdmin + tanstack-table | ✅ Build composite | Sort, filter, paginate |
| SearchInput | Custom | 🆕 Create new | Debounced search |
| FilterDropdown | Custom | 🆕 Create new | Academic filter menus |

---

## Dashboard & Statistics

| Component | Source | Decision | Notes |
|---|---|---|---|
| StatCard | Kiaalap pattern + Custom | 🆕 Adapt + create | IP, IPK, SKS, KRS status |
| ChartContainer | TailAdmin pattern | 🆕 Create | Recharts wrapper |
| LineChart (Recharts) | Custom | 🆕 Create | IP/IPK trend |
| BarChart (Recharts) | Custom | 🆕 Create | SKS distribution |
| PieChart (Recharts) | Custom | 🆕 Create | Grade distribution |
| RadarChart (Recharts) | Custom | 🆕 Create | Academic competency |

---

## Academic-Specific Components

| Component | Source | Decision | Notes |
|---|---|---|---|
| KRSBuilder | Custom | 🆕 Create new | Main feature — complex builder |
| CourseCard | Kiaalap pattern + Custom | 🆕 Adapt + create | Course selection card |
| CourseScheduleViewer | Custom | 🆕 Create new | Schedule display |
| PrerequisiteAlert | Custom | 🆕 Create new | Shows prerequisite errors |
| ScheduleConflictAlert | Custom | 🆕 Create new | Conflict detection display |
| CreditLimitAlert | Custom | 🆕 Create new | SKS limit warnings |
| KRSSummaryPanel | Custom | 🆕 Create new | Total SKS, status, validation |
| KRSStatusBadge | Custom | 🆕 Create new | Draft/Submitted/Approved/Revision |
| AcademicProgress | Custom | 🆕 Create new | SKS progress bar + milestones |
| GPAOverview | Custom | 🆕 Create new | IP, IPK, grade breakdown |
| AttendanceSummary | Custom | 🆕 Create new | Attendance percentage + history |
| GradeTable | Custom | 🆕 Create new | Detailed grade view |
| KRSApprovalPanel | Custom | 🆕 Create new | Lecturer review interface |
| CourseDemandAnalyzer | Custom | 🆕 Create new | Admin analytics table |
| AIChatPanel | Custom | 🆕 Create new | AI Academic Assistant chat |
| AIRecommendationCard | Custom | 🆕 Create new | AI suggestions card |
| ConsultationCard | Custom | 🆕 Create new | Consultation session card |
| ScheduleCalendar | TailAdmin FullCalendar | ✅ Adapt | Weekly schedule view |
| NotificationItem | Custom | 🆕 Create new | Individual notification |
| NotificationDropdown | TailAdmin pattern | 🆕 Adapt | Notification bell dropdown |
| EmptyState | Custom | 🆕 Create new | No data illustration |
| LoadingState | TailAdmin skeleton | ✅ Adapt | Full-page loading |
| ErrorState | Custom | 🆕 Create new | Error display with retry |

---

## Form Components

| Component | Source | Decision | Notes |
|---|---|---|---|
| FormField | TailAdmin field.tsx | ✅ Adapt | Label + input + error |
| CourseSearchForm | Custom | 🆕 Create new | Course catalog search |
| KRSSubmitForm | Custom | 🆕 Create new | KRS submission with confirm |
| AttendanceCorrectionForm | Custom | 🆕 Create new | Attendance correction request |
| ConsultationRequestForm | Custom | 🆕 Create new | Schedule consultation |
| GradeInputForm | Custom | 🆕 Create new | Lecturer grade entry |
| StudentProfileForm | Custom | 🆕 Create new | Student data management |

---

## Status Summary

| Category | Total | From TailAdmin | From shadcn pattern | Custom/New |
|---|---|---|---|---|
| Layout | 8 | 7 | 0 | 1 |
| Base UI | 22 | 22 | 0 | 0 |
| Composite | 7 | 2 | 3 | 2 |
| Dashboard | 7 | 1 | 0 | 6 |
| Academic | 20 | 1 | 0 | 19 |
| Forms | 7 | 1 | 0 | 6 |
| **Total** | **71** | **34** | **3** | **34** |
