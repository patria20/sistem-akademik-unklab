# DATABASE DESIGN SPECIFICATION — SIAM-UNKLAB
## Entity Relationship and Mock Data Schema

---

## 1. Relational Entity Schema

### 1.1 Users & Authentication (`users`)
- `id`: string (UUID or standard identifier, e.g., `usr_mhs_01`)
- `username`: string
- `email`: string (e.g., `mahasiswa@unklab.ac.id`)
- `name`: string
- `role`: `'student' | 'lecturer' | 'admin'`
- `avatar`: string
- `phone`: string
- `status`: `'active' | 'inactive'`

### 1.2 Student Academic Profile (`students`)
- `id`: string
- `userId`: string (FK -> `users.id`)
- `nim`: string (e.g., `105022110001`)
- `programStudy`: string (e.g., `Informatika`)
- `faculty`: string (e.g., `Fakultas Ilmu Komputer`)
- `academicAdvisorId`: string (FK -> `lecturers.id`)
- `currentSemester`: number (e.g., 5)
- `cumulativeGpa`: number (e.g., 3.65)
- `lastSemesterGpa`: number (e.g., 3.80)
- `creditsEarned`: number (e.g., 88)
- `maxCreditLimit`: number (e.g., 24 - based on GPA >= 3.0)

### 1.3 Lecturer Academic Profile (`lecturers`)
- `id`: string
- `userId`: string (FK -> `users.id`)
- `nidn`: string (e.g., `0912038401`)
- `title`: string (e.g., `M.Kom., Ph.D.`)
- `department`: string (e.g., `Informatika`)

### 1.4 Courses Catalog (`courses`)
- `id`: string (e.g., `IF301`)
- `code`: string (e.g., `CS204`)
- `name`: string (e.g., `Pemrograman Web Lanjut`)
- `credits`: number (e.g., 3)
- `semester`: number (e.g., 5)
- `curriculumYear`: number (e.g., 2024)
- `prerequisites`: string[] (Array of Course IDs, e.g., `['CS102']`)
- `isMandatory`: boolean

### 1.5 Classes & Sections (`classes`)
- `id`: string (e.g., `cls_cs204_a`)
- `courseId`: string (FK -> `courses.id`)
- `section`: string (e.g., `A`)
- `lecturerId`: string (FK -> `lecturers.id`)
- `day`: `'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'`
- `startTime`: string (e.g., `08:00`)
- `endTime`: string (e.g., `10:30`)
- `room`: string (e.g., `GK1-302`)
- `capacity`: number (e.g., 40)
- `enrolled`: number (e.g., 35)

### 1.6 Study Plan / KRS (`study_plans`)
- `id`: string (e.g., `krs_2026_1_mhs01`)
- `studentId`: string (FK -> `students.id`)
- `academicYear`: string (e.g., `2026/2027`)
- `semester`: number (e.g., 1)
- `status`: `'draft' | 'submitted' | 'approved' | 'revision'`
- `notes`: string
- `advisorFeedback`: string
- `submittedAt`: string (ISO date)
- `reviewedAt`: string (ISO date)

### 1.7 Study Plan Items / Selected Courses (`study_plan_items`)
- `id`: string
- `studyPlanId`: string (FK -> `study_plans.id`)
- `classId`: string (FK -> `classes.id`)
- `courseId`: string (FK -> `courses.id`)
- `gradeLetter`: string (e.g., `'A' | 'B+' | 'B' | null`)
- `gradePoint`: number (e.g., `4.0 | 3.5 | null`)

### 1.8 Attendance Records (`attendances`)
- `id`: string
- `classId`: string (FK -> `classes.id`)
- `studentId`: string (FK -> `students.id`)
- `meetingNumber`: number (1 - 16)
- `date`: string
- `status`: `'hadir' | 'izin' | 'sakit' | 'alpa'`
- `correctionRequested`: boolean
- `correctionReason`: string
- `correctionStatus`: `'none' | 'pending' | 'approved' | 'rejected'`

### 1.9 Consultations (`consultations`)
- `id`: string
- `studentId`: string (FK -> `students.id`)
- `lecturerId`: string (FK -> `lecturers.id`)
- `topic`: string
- `message`: string
- `status`: `'waiting' | 'scheduled' | 'completed'`
- `scheduledDate`: string
- `lecturerReply`: string
- `createdAt`: string

### 1.10 Notifications (`notifications`)
- `id`: string
- `userId`: string
- `title`: string
- `message`: string
- `type`: `'info' | 'success' | 'warning' | 'danger'`
- `link`: string
- `read`: boolean
- `createdAt`: string
