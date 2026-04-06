# IssueTracker Pro 🎯

**Advanced Multi-Tenant SaaS Issue Tracking & Assignment System** — A scalable platform for organizations to manage professional support and internal issues with complete data isolation, automated staff assignment, and branded company dashboards.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.18-green)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Complete System Workflow](#complete-system-workflow)
- [User Roles & Permissions](#user-roles--permissions)
- [Admin Dashboard — Full Feature Breakdown](#admin-dashboard--full-feature-breakdown)
- [Staff Performance Report](#staff-performance-report)
- [Email Notification System](#email-notification-system)
- [Intelligent Auto-Assignment Engine](#intelligent-auto-assignment-engine)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Deployment](#deployment)
- [License](#license)

---

## 🎯 Overview

**IssueTracker Pro** is a high-performance **Multi-Tenant SaaS** platform designed for professional organizations. Unlike traditional single-tenant systems, it allows multiple companies to operate on the same infrastructure while ensuring **strict data isolation** via `tenantId` partitioning.

The system automates the entire issue lifecycle within each organization — from submission to resolution — using tenant-aware assignment algorithms, priority-weighted metrics, and custom-branded notifications.

### 🏢 Multi-Tenant Architecture
- **Data Isolation**: All Users, Issues, and Meetings are logically partitioned by `tenantId`.
- **Organization Branding**: Each tenant has its own Company Name, Website, and Logo which dynamically updates the dashboard experience.
- **Shared Infrastructure, Private Data**: Multiple organizations can register and coexist securely with zero cross-tenant data leakage.

| Feature | Description |
|---------|-------------|
| 🌐 Multi-Tenant Isolation | Secure data partitioning ensuring each organization only sees its own users, issues, and analytics |
| 🤖 Auto-Assignment Engine | Domain-aware routing that matches issues to best-fit staff *within* the specific organization |
| 🎨 Branded Dashboards | Custom company logos and branding elements for a personalized organization experience |
| 📊 Staff Performance Reports | Tenant-scoped performance metrics with live scoring over 60-day rolling windows |
| 🏆 Reward Eligibility | Automated tracking for high-performing staff members (score ≥ 90%) |
| 📧 Smart Notifications | Real-time email updates for assignments, status changes, and account management |
| 🔐 Advanced RBAC | Industry-standard JWT authentication with granular role-based access control |

---

## 🔄 Complete System Workflow

This section explains the full lifecycle of the system from registration to issue resolution.

### Step 1 — Organization Registration & User Joining

Users can either **Create a New Organization** or **Join an Existing One**:

- **Creating an Org**: An Admin registers with a `companyName`. The system generates a unique `tenantId` and establishes the organization's branding (logo/website).
- **Joining an Org**: By providing an existing `companyName`, users are automatically grouped into the same tenant ecosystem.

**Available Roles**:
- **Team (Staff)** — Technical experts who resolve issues within their organization. They select **category expertise** (e.g., IT, HR, Finance) during registration.
- **Client** — Employees within the organization who report issues.
- **Admin** — Controls the organization-specific dashboard and user management.

Every record is tagged with a `tenantId` to enforce strict security boundaries.

---

### Step 2 — Login & Authentication

All users log in via `/api/auth/login`. A **JWT token** is issued and stored in a secure cookie. The middleware validates this token on every request and enforces role-based routing:

```
User logs in → JWT issued → Stored in cookie → Middleware validates on every request
       ↓                                                        ↓
  Role = client → /client-dashboard               Unauthorized → Redirect to /
  Role = team   → /team-dashboard
  Role = admin  → /admin-dashboard
```

---

### Step 3 — Client Raises an Issue

A client fills out the issue form on their dashboard with:
- **Title** and **Description**
- **Category** (Infrastructure, IT/Technical, HR, Finance, etc.)
- **Priority** (Low, Medium, High, Critical)
- Optional: Due Date, Tags

On submission, the system:
1. Saves the issue to MongoDB with `status: "Open"`
2. Triggers the **Intelligent Auto-Assignment Engine**
3. Sends a **Gmail email** to the assigned staff member
4. Sends a **Gmail email** to the client confirming their issue was assigned

---

### Step 4 — Intelligent Auto-Assignment Engine

When an issue is created, the engine automatically selects the best staff member:

```
New Issue Created
      ↓
Filter staff by issue category (matching expertise)
      ↓
Calculate priority-weighted efficiency score for each match
      ↓
Check availability (< 3 active issues = available)
      ↓
Assign to highest-efficiency available staff
      ↓
If all busy → assign to staff with fewest active issues (fallback)
```

#### Efficiency Score Formula

```
Efficiency (%) = (Sum of priority-weighted resolved issues / Sum of priority-weighted total assigned) × 100
```

**Priority Weights Used:**
| Priority | Weight |
|----------|--------|
| Critical | 4 |
| High | 3 |
| Medium | 2 |
| Low | 1 |

> New staff members with zero assignment history start at **100% efficiency** so they get equal opportunities.

---

### Step 5 — Staff Resolves the Issue

The assigned staff member logs into their **Team Dashboard** and:
- Views all issues assigned to them
- Can filter by category, status, priority
- Updates issue status: `Open → In Progress → Resolved → Closed`
- Adds comments for collaboration or audit trail
- When status is changed to **Resolved** or **Closed**, the **client receives an email notification**

---

### Step 6 — Admin Monitoring & Oversight

The Admin has full visibility into the system:
- Views **all issues** across all users
- Manages users (activate/deactivate accounts)
- Reviews **Staff Performance Reports** with live scoring
- Checks **Reward Eligibility** for each staff member
- Edits issue status, deletes issues
- Sees users separated into Administrator / Staff / Client sections

---

## 👥 User Roles & Permissions

### 🟢 Client (Employee)

| Permission | Access |
|-----------|--------|
| Submit new issues | ✅ |
| View own issues | ✅ |
| Add comments to own issues | ✅ |
| View other users' issues | ❌ |
| Assign issues to staff | ❌ |
| Access Admin/Staff features | ❌ |

**Dashboard includes**: Issue submission form, personal issue list with status tracking, comment history.

---

### 🔵 Team (Technical Staff)

| Permission | Access |
|-----------|--------|
| View assigned issues | ✅ |
| Update issue status | ✅ |
| Add comments | ✅ |
| View category-specific issues | ✅ |
| Manually assign issues | ❌ |
| Manage users | ❌ |

**Category Specialization** — During registration, staff select their expertise:
- Infrastructure, IT/Technical, Portal, HR, Facilities, Finance, Security, Operations, Support, Policy

These categories are stored in MongoDB and used by the assignment engine to route relevant issues.

---

### 🔴 Admin (Administrator)

| Permission | Access |
|-----------|--------|
| Full access to all issues | ✅ |
| Create, update, delete any issue | ✅ |
| Manage users (activate/deactivate) | ✅ |
| View staff performance reports | ✅ |
| View reward eligibility status | ✅ |
| Access all sections of user management | ✅ |

---

## 🛠️ Admin Dashboard — Full Feature Breakdown

The Admin Dashboard is divided into two main tabs:

### Tab 1 — Issues Management

- **All Issues Table**: Shows every issue in the system with Title, Status, Category, Assigned Staff, Created By, Date, and Actions
- **Filters**: Filter by Status (Open, In Progress, Resolved, Closed) and Category
- **Edit Issue**: Opens a dialog to update the issue status
- **Delete Issue**: Shows a confirmation dialog before permanently deleting an issue

---

### Tab 2 — User Management (3 Separate Sections)

Users are **not shown in one combined list**. They are organized into three distinct sections:

#### Section 1 — Administrator Users
Shows all users with role `admin`. Each row has Name, Email, Role badge, Department, Active/Inactive status, Join date, and an Activate/Deactivate button.

#### Section 2 — Staff Users
Shows all users with role `team`. Each name is interactive:
- **Hover** → Shows a tooltip with the staff member's short ID, their email, and the department(s)/categories they handle. A hint reads: *"Click name to view performance report"*
- **Click** → Opens the **Staff Performance Report Dialog** (see below)

#### Section 3 — Client Users
Shows all users with role `client`. Hover also shows their short ID and department info.

---

### Activate / Deactivate User

Admins can deactivate any user (except themselves). When a user is deactivated:
1. Their `isActive` flag is set to `false` in MongoDB
2. They are **unassigned from all active issues**
3. A **warning email** is automatically sent to the user with the following message:

> *"Your account has been deactivated by the admin. Please meet the department head admin to discuss regarding it."*

When reactivated, the user can log back in and access the system normally.

---

## 📊 Staff Performance Report

Clicking on any staff member's name in the Staff Users section opens a full **Performance Report Dialog**. This report is calculated **live from issue data** for the last 60 days.

### What's Shown

| Section | Description |
|---------|-------------|
| Staff Info | Name, Email, Short ID, Department/Categories |
| Performance Score | % score with color-coded progress bar |
| Issue Breakdown | Counts of Open, In Progress, Resolved, Closed issues |
| Reward Eligibility | Badge showing if the staff qualifies for rewards |

### Performance Score Calculation

```
Performance Score (%) = (Resolved + Closed) / Total Assigned × 100
```

Calculated over the **last 60 days** only.

### Color Coding

| Score Range | Color | Meaning |
|-------------|-------|---------|
| ≥ 90% | 🟢 Green | Excellent |
| 70–89% | 🟡 Yellow | Good |
| < 70% | 🔴 Red | Needs Improvement |

### Reward Eligibility

- **Eligible**: Score ≥ 90% → Gold trophy badge: *"✓ Eligible for Rewards"*
- **Not Eligible**: Score < 90% → Shows exact gap: *"Needs X% more to qualify"*

This eligibility flag is the foundation for future reward distribution features.

---

## 📧 Email Notification System

All emails are sent via **Nodemailer** using Gmail OAuth2. The system falls back to Ethereal Email (mock) if no Gmail credentials are configured.

### Emails Sent

| Trigger | Recipient | Subject |
|---------|-----------|---------|
| Issue assigned to staff | Staff member | `[Assigned] <Issue Title>` |
| Issue assigned (reporter confirmation) | Client | `[Update] Your issue has been assigned` |
| Issue status changed | Client | `[Update] <Title> is now <Status>` |
| Account deactivated by admin | Deactivated user | `[Warning] Your Account Has Been Deactivated` |

### Deactivation Email Content

The deactivation warning email includes:
- A bold red header: **"Account Deactivated"**
- A warning block in red: *"Please meet the department head admin to discuss regarding it."*
- Branded footer from Issue Tracking Portal System

---

## 🤖 Intelligent Auto-Assignment Engine

Located in `lib/assignment.ts`, this engine runs every time a new issue is created.

### Algorithm Steps

1. **Fetch all active staff** matching the issue's category
2. **For each staff member**, query their historical issues in that category
3. **Calculate efficiency score** using the priority-weighted formula
4. **Filter by availability** (max 3 active issues at a time)
5. **Sort by score** and assign to the most efficient available staff
6. **Fallback**: If no one is available, assign to staff with fewest active issues

### Staff Capacity Rule
- A staff member is considered **available** if they have fewer than **3 active (Open or In Progress) issues**
- This prevents overloading high-performing staff and ensures fair distribution within the organization

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.2.4** — App Router, Server Components
- **TypeScript 5.0** — Full type safety
- **Tailwind CSS 4.1** — Styling
- **shadcn/ui (Radix UI)** — 49 UI components including HoverCard, Dialog, Table, Tabs
- **Lucide React** — Icons
- **React Hook Form + Zod** — Form validation
- **Sonner** — Toast notifications

### Backend
- **Next.js API Routes** — RESTful endpoints
- **MongoDB 6.18** with **Mongoose 8.17** — Database and schema modeling
- **jsonwebtoken** — JWT authentication
- **bcryptjs** — Password hashing (10 salt rounds)
- **Nodemailer** — Email service with Gmail OAuth2

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or pnpm
- MongoDB Atlas account (or local MongoDB)
- Gmail account (optional, for email notifications)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/VSaini11/Issue-Tracking-web-app.git
cd issue-tracking-portal

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your credentials (see Environment Variables section)

# 4. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Create `.env.local` in the project root:

```env
# MongoDB (Required)
MONGDB_URI="your-mongodb-connection-string"

# JWT Secret (Required - use a strong 32+ char string)
JWT_SECRET="your-secret-key-here"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Gmail OAuth2 (Optional - for email notifications)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REFRESH_TOKEN="your-google-refresh-token"
EMAIL_USER="your-email@gmail.com"
```

> ⚠️ **Never commit `.env.local` to version control.**

### Setting Up Gmail OAuth2

```bash
node scripts/get-refresh-token.js
```

Follow the interactive prompts to generate your Gmail refresh token.

---

## 📁 Project Structure

```
issue-tracking-portal/
├── app/
│   ├── admin-dashboard/        # Admin panel (issues + user management + performance)
│   ├── client-dashboard/       # Client issue submission and tracking
│   ├── team-dashboard/         # Staff issue management
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/          # POST /api/auth/login
│   │   │   └── register/       # POST /api/auth/register
│   │   ├── issues/             # GET, POST /api/issues
│   │   │   └── [id]/           # PATCH, DELETE /api/issues/:id
│   │   ├── users/              # GET /api/users (admin only)
│   │   │   └── [id]/           # DELETE (toggle status) /api/users/:id
│   │   └── staff/              # GET /api/staff (team members by category)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Landing / Login page
├── components/
│   └── ui/                     # 49 shadcn/ui components
├── hooks/
│   ├── use-auth.ts             # Auth state management
│   └── use-issues.ts           # Issue CRUD hook
├── lib/
│   ├── mongodb.ts              # DB connection
│   ├── auth.ts                 # JWT utilities
│   ├── auth-edge.ts            # Edge-compatible JWT
│   ├── assignment.ts           # Intelligent auto-assignment engine
│   └── email.ts               # All email templates & Nodemailer setup
├── models/
│   ├── User.ts                 # User schema (id, tenantId, role, companyName, companyLogo, isActive)
│   ├── Issue.ts                # Issue schema (title, tenantId, status, priority, assignedTo, createdBy)
│   └── Meeting.ts              # Meeting schema (tenantId, adminId, schedule, link)
├── scripts/                    # Utility & migration scripts
├── middleware.ts               # JWT validation & route protection
└── package.json
```

---

## 📡 API Documentation

### Auth

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "securePassword",
  "role": "admin",
  "name": "Jane Smith",
  "companyName": "TechCorp",
  "companyWebsite": "https://techcorp.com",
  "companyLogo": "base64_encoded_logo"
}
```

> [!NOTE]
> If a `companyName` already exists, the user will be joined to that organization's `tenantId`.

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "securePassword" }
```

---

### Issues

#### Get Issues
```http
GET /api/issues?status=Open&category=HR
```
Returns issues filtered by role (clients see own, staff see assigned, admin sees all).

#### Create Issue
```http
POST /api/issues
{ "title": "...", "description": "...", "category": "HR", "priority": "High" }
```
Triggers auto-assignment and sends emails.

#### Update Issue
```http
PATCH /api/issues/:id
{ "status": "Resolved" }
```
Triggers status update email to client.

#### Delete Issue (Admin only)
```http
DELETE /api/issues/:id
```

---

### Users

#### Get All Users (Admin only)
```http
GET /api/users
```

#### Toggle User Active Status (Admin only)
```http
DELETE /api/users/:id
```
Toggles `isActive`. If deactivating, sends warning email to the user and unassigns them from issues.

#### Get Staff Members
```http
GET /api/staff
```
Returns team members filterable by category.

---

## 🔒 Security

- **JWT tokens** stored in secure httpOnly cookies
- **Password hashing** with bcryptjs (10 rounds)
- **Role-based access control** enforced at both middleware and API route level
- **Admin self-protection**: Admin cannot deactivate their own account
- **Input validation** with Zod on all forms
- **Mongoose sanitization** prevents NoSQL injection

### Production Security Checklist
- [ ] Use a strong `JWT_SECRET` (32+ characters)
- [ ] Enable HTTPS only
- [ ] Whitelist MongoDB IPs
- [ ] Set `Secure` and `SameSite` cookie flags
- [ ] Rotate Gmail refresh token regularly
- [ ] Implement API rate limiting

---

## 🔧 Scripts & Utilities

| Script | Command | Purpose |
|--------|---------|---------|
| Seed database | `npm run seed` | Create sample users and issues |
| Cleanup test data | `node scripts/cleanup-test-data.js` | Remove all test data |
| Fix legacy users | `node scripts/fix-legacy-users.js` | Migrate old user schema |
| Verify users | `node scripts/verify-users.js` | Check data integrity |
| Fix production users | `node scripts/fix-production-users.js` | Update prod records |
| Gmail token | `node scripts/get-refresh-token.js` | Get OAuth2 refresh token |
| Verify assignment | `node scripts/verify-assignment.js` | Test assignment logic |
| Seed assignment test | `node scripts/seed-assignment-test.js` | Create assignment test data |

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Set `NEXTAUTH_URL` to your production domain
5. Deploy ✅

### Manual / Docker

```bash
# Build
npm run build

# Start
npm start
```

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 📧 Contact & Support

- **Author**: Vaibhav Saini
- **GitHub**: [@VSaini11](https://github.com/VSaini11)
- **Repository**: [Issue-Tracking-web-app](https://github.com/VSaini11/Issue-Tracking-web-app)
- **Email**: vaibhavsaini709@gmail.com

For bugs and feature requests, please [open an issue](https://github.com/VSaini11/Issue-Tracking-web-app/issues).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — React framework
- [shadcn/ui](https://ui.shadcn.com/) — UI component library
- [Radix UI](https://www.radix-ui.com/) — Accessible primitive components
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework
- [MongoDB](https://www.mongodb.com/) — Database
- [Nodemailer](https://nodemailer.com/) — Email service
- [Vercel](https://vercel.com/) — Hosting platform

---

<div align="center">
  <p>Built with ❤️ using Next.js and TypeScript</p>
  <p>© 2025 IssueTracker Pro. All rights reserved.</p>
</div>
