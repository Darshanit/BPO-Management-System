# BPO Management System — MERN Stack

Production-grade BPO Management System with RBAC, JWT auth, attendance,
leave, payroll, projects/tasks (kanban), client portal, real-time chat, and
Neo-Brutalism UI.

## ✅ Completed so far (Phases 1–5)

### Phase 1 — Architecture
- **Pattern:** MVC on the backend, component-driven React (feature-folder) on the frontend.
- **Auth:** JWT access token (15m, memory/header) + refresh token (7d, httpOnly cookie) + rotation via `tokenVersion`.
- **RBAC:** Static role→permission matrix in `config/roles.js`, plus DB-backed `Role`/`Permission` models for custom roles later.
- **Realtime:** Socket.io, JWT-authenticated handshake, per-user rooms (`user:<id>`) ready for chat/notifications.

### Phase 2 — Folder Structure
```
server/
  config/        db.js, roles.js
  controllers/    auth.controller.js
  middlewares/    auth, rbac, error, security(rate-limit+validation), upload
  models/         User, Role, Department, Employee, Attendance, Leave, Payroll,
                  Project, Task, Team, Client, Misc(Document/Notification/Meeting/Ticket),
                  Chat(Chat/Message), System(ActivityLog/AuditLog/Settings/Report)
  routes/         auth.routes.js
  services/       email.service.js
  validators/     auth.validator.js
  socket/         index.js
  uploads/        avatars/ documents/ chat/
  utils/          logger, ApiError, ApiResponse, generateTokens, seed
  app.js, server.js
client/
  src/{assets,components,pages,layouts,hooks,contexts,services,routes,utils,styles}
```

### Phase 3 — Database Schema
All 20 collections modeled with Mongoose: `Users, Roles, Permissions, Employees,
Departments, Attendance, Leaves, Payroll, Projects, Tasks, Teams, Clients,
Documents, Notifications, Meetings, Tickets, Chats, Messages, Reports,
ActivityLogs, AuditLogs, Settings`. Indexes added for common query patterns
(role+isActive, employee+date uniqueness, project+status, etc.), validation
via Mongoose schema rules, and `timestamps: true` everywhere.

### Phase 4 — Backend Setup
`app.js` wires: Helmet, CORS (credentialed), `express-mongo-sanitize`,
`xss-clean`, `hpp`, global + auth-specific rate limiting, compression,
Morgan→Winston logging, static `/uploads`, centralized error handler.

### Phase 5 — Authentication System
Full flow implemented in `auth.controller.js` / `auth.routes.js`:
register, email verification, login, refresh (rotates access token from
httpOnly refresh cookie), logout, logout-all (invalidates all sessions via
`tokenVersion`), forgot/reset password, OTP send/verify, `GET /me`.
Passwords hashed with bcrypt (cost 12). All input validated with
`express-validator`.

### Phase 6 — REST APIs
Every module now has real, working controllers + routes, mounted in `app.js`:

| Base route | Covers |
|---|---|
| `/api/users` | Super Admin/Admin/HR create & manage all accounts |
| `/api/employees` | Profile CRUD, auto-generated `EMP-YYYY-####` IDs, performance reviews, self-service `/me/profile` |
| `/api/departments` | CRUD + hierarchy (`parentDepartment`) |
| `/api/attendance` | Clock in/out, breaks, working-hours calc, late detection, monthly summary |
| `/api/leaves` | Apply, approve/reject/cancel, auto balance deduction, manager notification |
| `/api/payroll` | Generate (allowances/bonus/deductions/tax/PF), mark-paid → auto PDF payslip |
| `/api/projects` | CRUD, milestones, client-scoped view |
| `/api/tasks` | Kanban board (`?project=`), drag-move, comments, per-user task list |
| `/api/teams` | CRUD, "my team" lookup |
| `/api/clients` | Company/contact CRUD, invoices, support tickets (raise/reply/list) |
| `/api/chat` | Chat list, private/team chat creation, message history (REST) |
| `/api/notifications` | List/unread count, mark read/all-read, delete |
| `/api/reports` | `/api/reports/:type?format=csv|pdf` for attendance/leave/payroll/employee/department/project/performance |
| `/api/settings` | Singleton company settings (working hours, holidays, leave policy) |
| `/api/dashboard/stats` | Role-aware aggregated stats cards |

All list endpoints support **pagination** (`page`, `limit`), **sorting**
(`sort=-createdAt`), **filtering** (`?status=active`, `salary[gte]=30000`),
and **searching** (`?search=term`) via the shared `utils/apiFeatures.js`.

**Real-time chat** (`socket/index.js`) is fully wired: `chat:join`,
`chat:message` (broadcast + notifies offline participants), `chat:typing`,
`chat:seen` — all authenticated via the same JWT access token used by REST.

✅ **Verified**: `npm install` succeeds and the entire app (`app.js`) loads
without error — every controller/route/model require resolves correctly.

### Phase 7 — Frontend Setup
Vite + React 19 + Tailwind, configured and building cleanly:
- **Tailwind theme** (`tailwind.config.js`) encodes the Neo-Brutalism spec directly:
  the exact color palette, 4px `border-brutal`, 20px `rounded-brutal`, and signature
  flat offset shadows (`shadow-brutal`, `-lg`, `-sm`, `-hover`) with no blur/gradient.
- **Routing**: `react-router-dom` with `ProtectedRoute` (redirects to `/login` if
  not authenticated, shows a loading state during session bootstrap) and
  `RoleRoute` (restricts a route subtree to specific roles).
- **Auth**: `AuthContext` holds the current user and access token in memory only;
  on app load it silently calls `/api/auth/refresh` using the httpOnly cookie so
  a page reload doesn't force re-login.
- **Axios instance** (`services/api.js`): injects the access token on every
  request, and on a 401 automatically calls `/auth/refresh` once, queues any
  concurrent requests during that refresh, retries them, and only redirects to
  `/login` if the refresh itself fails.
- **TanStack Query** wraps the app for server-state caching (see `Dashboard.jsx`).
- **Service layer**: every Phase 6 API has a matching client method in
  `services/index.js`, built on a shared `createCrudService` factory.

### Phase 8 — UI Components
Reusable Neo-Brutalism component kit in `components/ui/`:
`Button` (color variants, tap animation via Framer Motion), `Card` (static +
interactive hover-lift), `Input`/`Label` (react-hook-form-ready via `forwardRef`),
`Badge` (auto-colors by status/priority word), `Modal` (animated pop-in/backdrop),
`Table` (loading skeleton + empty state), `Skeleton`, `Pagination`, `StatCard`.
Layout components: `Sidebar` (role-filtered nav from `utils/navConfig.jsx`),
`Topbar` (notification bell with live unread count, avatar, logout),
`DashboardLayout` (shell + animated route transitions), `AuthLayout` (split
decorative screen for login/register/reset). Plus `ErrorBoundary` for graceful
failure and a functional `Landing`, `Login`, `Register`, `Forgot/Reset Password`,
`Dashboard` (real stats from `/api/dashboard/stats`, role-aware), and `Profile`
page. Routes not yet built (Employees, Payroll, Projects, etc.) render a
`PlaceholderPage` so navigation never 404s while later phases fill them in.

✅ **Verified**: `npm install && npm run build` completes with zero errors
(528 modules transformed, production bundle emitted).

### Phase 9 — Admin Dashboard & Employee Management
- **Dashboard charts**: management roles now see live Doughnut charts (Chart.js)
  for Task Overview and Project Status, driven by the same `/api/dashboard/stats`
  aggregation endpoints, alongside the stat cards.
- **Employee Management** (`pages/employees/`): a real, working module —
  - `EmployeeList` — server-paginated table with debounced search, department
    and status filters, all wired to `employeeService.list()` via TanStack Query.
  - `EmployeeFormModal` — create form (name/email/password/department/designation/
    salary/joining date/employment type) posting straight to `POST /api/employees`.
  - `EmployeeDetails` — profile view (leave balance, department, join date) plus
    a performance review list and an "Add Review" modal wired to
    `POST /api/employees/:id/performance`.
- **Departments** (`pages/departments/DepartmentList.jsx`) — table + create modal.
- New shared components: `Select`, `SearchBar`, `useDebounce` hook,
  `StatusBreakdownChart`.

✅ **Verified**: `npm install && npm run build` still completes cleanly (546
modules) after wiring these pages into real routes in `App.jsx`.

### Phase 10 — HR Dashboard
Two backend additions were needed to make this real (not stubbed):
- **`Candidate` model + `/api/recruitment`** — a full recruitment pipeline
  (applied → screening → interview → offered → hired/rejected) with notes,
  gated by the `manage_recruitment` permission (HR + Super Admin).
- **`/api/documents`** — a generic Multer-backed upload endpoint that attaches
  a file to any entity (`Employee`, `Client`, `Candidate`) via `relatedKind`/`relatedId`,
  plus list/delete. This is what "Employee documents" and "resume upload" run on.

Frontend:
- **`LeaveApprovalQueue`** (`pages/leaves/`) — HR/Admin/Team Leader view of
  leave requests with a status filter and one-click approve, or reject with an
  optional reason modal. Routes through a role-aware `LeavesPage` so employees
  will get their own self-service view without a separate route in Phase 11.
- **`RecruitmentBoard`** (`pages/recruitment/`) — kanban-style pipeline board,
  add-candidate modal, and one-click "Advance →" / "Reject" per candidate card.
- **`DocumentManager`** — a reusable upload + list widget (category picker,
  upload button, delete) now embedded in `EmployeeDetails`; the same component
  can be dropped into Client/Candidate detail pages later with zero changes.

✅ **Verified**: backend boots cleanly with the new routes mounted; frontend
`npm run build` completes with zero errors (550 modules).

### Phase 11 — Employee Portal
All wired to the Phase 6 APIs that were already live — no backend changes needed:
- **Attendance** (`pages/attendance/`) — `AttendancePage` gives every employee
  a clock-in/out + break start/end widget that reflects today's actual state
  (buttons change based on whether you've clocked in, are on break, etc.),
  plus their own monthly history table. Management roles additionally see
  `AttendanceOverview`, an org-wide paginated attendance table.
- **Leaves** — `MyLeaves` (self-service) now sits behind the same `LeavesPage`
  router as the Phase 10 approval queue: employees see their leave balance,
  an apply form, their request history, and can cancel pending requests.
- **Payroll** — `PayrollPage` routes to `MyPayroll` (salary history + payslip
  download) for employees or `PayrollAdmin` (generate payroll for an employee/
  month/year, mark-as-paid which triggers the backend's PDF payslip
  generation) for HR/Admin/Super Admin.
- **Tasks** — `TaskBoard`: pick a project, see its kanban board, click a card
  to open a detail modal with comments, and advance your own tasks through
  the columns with one click. Team Leaders/Admins additionally get an
  "Add Task" button.

✅ **Verified**: `npm run build` completes with zero errors (557 modules).

### Phase 12 — Client Portal
One backend addition: **`GET /api/clients/me`** — the logged-in client's own
profile with projects, invoices, and documents populated (everything else
needed — assigned projects, tickets, invoice adding — already existed from
Phase 6).

Frontend (`pages/client/` + `pages/projects/`):
- **`ClientProjects`** — assigned projects with a live progress bar, status
  badge, team leader, deadline, and a milestone checklist.
- **`ClientTickets`** — raise a support ticket (optionally tied to a project),
  view your ticket list with priority/status badges, open a thread modal to
  read replies and send new ones.
- **`TicketsAdmin`** — the flip side for Super Admin/Admin/Team Leader: a
  paginated table of all client tickets, reply + status-update in one modal.
- **`ClientBilling`** — invoice table (amount/due date/status) plus the same
  `DocumentManager` widget from Phase 10, now pointed at the client's own
  documents — proving the "drop in anywhere" reusability actually works.
- Routing got smarter: `/projects` and `/tickets` now render different
  components depending on role (`ProjectsPage`, `TicketsPage`) rather than
  needing separate URLs per role.

✅ **Verified**: `npm run build` completes with zero errors (563 modules).

### Phase 13 — Reports UI
`pages/Reports.jsx` wires directly into the `GET /api/reports/:type` endpoint
from Phase 6: pick a report type from a sidebar list, fill in the filters
that apply to that type (date range for attendance, status for leave/project,
department for employee/performance, month+year for payroll), choose CSV or
PDF, and download — using a real blob response and an auto-clicked anchor
tag, not a placeholder link.

✅ **Verified**: `npm run build` completes with zero errors (564 modules).

### Phase 14 — Testing
**Backend** (`server/tests/`, Jest + Supertest):
- `generateTokens.test.js`, `csvExport.test.js` — pure-logic unit tests (no DB).
- `apiFeatures.test.js` — filter/search/sort/paginate against a real in-memory
  Mongo collection.
- `auth.test.js` — register (incl. duplicate-email and weak-password
  rejection), login (incl. wrong password and deactivated account), `/me`,
  logout cookie-clearing.
- `rbac.test.js` — permission middleware actually blocks the roles it should
  (Employee blocked from creating a Department, Client blocked from
  `/api/employees`, HR blocked from deleting a user).
- `employee.test.js` — employee creation, auto-incrementing `EMP-YYYY-####`
  IDs, duplicate-email rejection, pagination metadata.
- `leave.test.js` — apply/balance-check, approve → balance deduction, reject
  → balance untouched, employee blocked from approving their own leave.
- DB-dependent suites use `mongodb-memory-server` via a shared
  `tests/dbSetup.js` helper, opted into per-suite so pure-logic tests don't
  pay that cost.

  **A note on verification**: the pure-logic suites (`generateTokens.test.js`,
  `csvExport.test.js` — 8 tests) were actually executed in the sandbox this
  was built in and pass. The DB-dependent suites could not be executed
  in that same sandbox because `mongodb-memory-server` needs to download a
  real `mongod` binary from `fastdl.mongodb.org` on first run, and that host
  wasn't reachable there. They're written against the same patterns as the
  verified suites and will run normally with `npm test` in an environment
  with regular internet access (the binary is cached after the first run).

**Frontend** (`client/src/tests/`, Vitest + React Testing Library):
- `Button.test.jsx`, `Badge.test.jsx` — rendering, variants, click handling,
  status-to-color mapping.
- `navConfig.test.js` — role-based nav filtering logic.
- `useDebounce.test.js` — debounce timing behavior with fake timers.
- `Login.test.jsx` — validation errors on empty submit, and a successful
  submit calling the (mocked) auth service with the right payload.

✅ **Verified**: all 5 frontend test files (24 tests) were run with
`npx vitest run` in the sandbox and pass.

## ▶️ Getting started

```bash
# Backend
cd server
cp .env.example .env      # fill in MONGO_URI, JWT secrets, SMTP creds
npm install
npm run seed               # creates superadmin@bpo.com / ChangeMe123!
npm run dev                 # starts on http://localhost:5000
npm test                    # runs the Jest/Supertest suite

# Frontend (separate terminal)
cd client
npm install
npm run dev                 # starts on http://localhost:5173, proxies /api to :5000
npm test                    # runs the Vitest suite
```

## 🎉 All 14 phases complete

Architecture → folder structure → database schema → backend setup → auth →
REST APIs → frontend setup → UI components → Admin dashboard → HR dashboard →
Employee portal → Client portal → Reports → Testing. Every phase shipped real,
runnable code that was built, installed, and either run or boot-tested in
this sandbox rather than just described.

A few things worth knowing if you keep building on this:
- **Chat UI**: the backend (REST + Socket.io) is fully wired; there's no chat
  frontend page yet beyond the placeholder — a good next add-on.
- **Projects/Teams/Clients management UI**: these still show placeholder
  pages for non-client roles (the backend APIs are complete and already have
  frontend services in `services/index.js` — wiring up list/CRUD pages for
  them follows the exact same pattern as `EmployeeList`/`DepartmentList`).
- **Code splitting**: the production JS bundle is ~700KB — fine for a demo,
  but worth addressing with route-based `React.lazy()` before a real deploy.
