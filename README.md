# IssueTracker Pro 🎯

**Intelligent Issue Tracking & Assignment System** - An automated issue resolution platform that intelligently assigns issues to the most efficient available technical staff using priority-weighted performance metrics and real-time Gmail notifications.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.18-green)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [User Roles & Permissions](#user-roles--permissions)
- [API Documentation](#api-documentation)
- [Scripts & Utilities](#scripts--utilities)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**IssueTracker Pro** is an intelligent Issue Tracking System that automates the entire issue resolution workflow. Employees raise issues, and the system intelligently assigns them to the most efficient available technical staff using priority-weighted performance metrics.

The platform continuously evaluates technical staff efficiency based on real issue-handling behavior and ensures that critical issues are resolved by the most capable resolvers. Real-time Gmail notifications keep all stakeholders informed at every stage, making the system fast, reliable, and fully automated.

### Key Highlights

- **🤖 Intelligent Assignment Engine**: Automatically assigns issues to the most efficient technical staff based on priority-weighted performance metrics and real-time staff evaluation
- **📊 Performance Metrics Analysis**: Continuously evaluates staff efficiency based on actual issue-handling behavior (resolution time, issue quality, workload capacity)
- **⚡ Dynamic Learning**: The system adapts and improves assignment decisions based on historical performance data and ongoing issue resolution patterns
- **🔔 Real-Time Gmail Notifications**: Automated email alerts at every stage (Issue Creation, Assignment, Status Updates, Issue Resolution)
- **🎯 Priority-Weighted Assignments**: Critical issues are automatically routed to the most capable resolvers with proven track records
- **🔐 Multi-Role Access Control**: Secure role-based authentication for Clients, Technical Staff, and Administrators
- **📈 Live Performance Dashboards**: Real-time analytics showing staff efficiency, resolution rates, and system-wide metrics


---

## ✨ Features

### 🤖 Intelligent Assignment Engine
- **Automated Issue Assignment**: Issues are automatically assigned to the most efficient available technical staff
- **Priority-Weighted Algorithms**: Assignment decisions consider issue priority, staff workload, and historical performance metrics
- **Real-Time Staff Evaluation**: Continuous assessment of technical staff efficiency based on:
  - Issue resolution time
  - Quality of resolutions
  - Current workload capacity
  - Category expertise
  - Success rate on critical issues
- **Dynamic Learning**: The system improves assignment accuracy over time based on performance data
- **Workload Balancing**: Ensures optimal distribution of issues across technical staff

### � Real-Time Gmail Notifications
- **Issue Creation Notifications**: Instant alerts when employees raise new issues
- **Assignment Notifications**: Technical staff notified immediately upon issue assignment
- **Status Update Alerts**: All stakeholders informed when issue status changes
- **Resolution Confirmations**: Automated notifications when issues are resolved
- **Email Service Integration**: Seamless Gmail integration using Nodemailer with OAuth2

### �🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (RBAC) with three user levels:
  - **Client (Employee)**: Submit and track personal issues
  - **Team (Technical Staff)**: Manage assigned issues and view category-specific workload
  - **Admin**: Full system access with analytics, user management, and performance monitoring
- **Password encryption** using bcryptjs
- **Middleware-based authentication check** protecting all routes

### 📊 Issue Management
- **Multi-category support**: Infrastructure, IT/Technical, Portal, HR, Facilities, Finance, Security, Operations, Support, Policy
- **Priority levels**: Low, Medium, High, Critical
- **Status tracking**: Open, In Progress, Resolved, Closed
- **Intelligent automated assignment** to most efficient technical staff
- **Comment system** for collaboration
- **Due date tracking**
- **Tag-based filtering**

### 📈 Dashboard Features

#### Client Dashboard
- Submit new issues with detailed descriptions
- Track personal issue status
- View issue history and comments
- Update profile information

#### Team Dashboard
- View assigned issues by category
- Update issue status and priority
- Add comments and collaborate
- Category-based filtering
- Performance metrics for assigned work

#### Admin Dashboard
- Comprehensive analytics and reporting
- User management (activate/deactivate accounts)
- System-wide issue overview
- Advanced filtering and search
- Audit trails and compliance reporting

### 🎨 UI/UX Features
- **Modern, professional interface** with shadcn/ui components
- **Dark mode support** via next-themes
- **Responsive design** optimized for desktop and mobile
- **Real-time updates** with dynamic data fetching
- **Interactive charts** using Recharts
- **Toast notifications** for user feedback
- **Form validation** with React Hook Form and Zod

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript 5.0
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.1
- **Component Library**: Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Notifications**: Sonner (toast)

### Backend
- **API**: Next.js API Routes
- **Database**: MongoDB 6.18 with Mongoose 8.17
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer with Gmail OAuth2

### Development Tools
- **Package Manager**: npm/pnpm
- **Linting**: ESLint 9
- **CSS Processing**: PostCSS with Tailwind
- **Font**: Geist (Next.js optimized font)

---

## 🏗️ System Architecture

### Intelligent Issue Tracking & Assignment System

The system follows a comprehensive workflow designed to automate issue resolution:

#### 1️⃣ **Client Browser & Frontend**
- Employees access the **Next.js Frontend** to raise issues via the client dashboard
- Team members view assigned issues through the team dashboard
- Admins monitor system-wide performance through the admin dashboard

#### 2️⃣ **Middleware Authentication Check**
- All requests pass through **authentication middleware** for security
- Validates JWT tokens and enforces role-based access control
- Routes unauthenticated users to login page

#### 3️⃣ **Issue Tracking Platform**
The core platform consists of three specialized dashboards:
- **Client Dashboard**: Issue creation and tracking
- **Team Dashboard**: Assigned issue management and resolution
- **Admin Dashboard**: System oversight and performance monitoring

#### 4️⃣ **Intelligent Assignment Engine**
The heart of the system that ensures optimal issue resolution:
- **Priority-Weighted Assignments**: Considers issue urgency and complexity
- **Real-Time Staff Evaluation**: Analyzes current workload and availability
- **Performance Metrics Analysis**: Uses historical data to select the best resolver

The engine performs **dynamic learning**, continuously updating staff performance profiles based on:
- Resolution time efficiency
- Issue quality metrics
- Category expertise
- Success rates

#### 5️⃣ **Database Layer (MongoDB)**
Stores all system data in two primary collections:
- **Users Collection**: Employee profiles, technical staff data, and performance metrics
- **Issues Collection**: Complete issue lifecycle with status history and audit trails

#### 6️⃣ **Email Service (Gmail Notifications)**
Real-time notifications powered by Nodemailer with Gmail OAuth2:
- 📧 **Issue Creation**: Notifies admin and relevant team
- 📧 **Assigned Issue**: Alerts assigned technical staff member
- 📧 **Status Updates**: Informs stakeholders of progress
- 📧 **Issue Resolution**: Confirms completion to all parties

#### 7️⃣ **Priority Recommendation System**
Visual indicators for prioritization:
- 🔴 **High Priority**: Critical issues requiring immediate attention
- 🟡 **Medium Priority**: Standard issues in normal queue
- 🟢 **Low Priority**: Non-urgent maintenance items

### Architecture Flow

```
Employee Raises Issue → Middleware Auth Check → Issue Tracking Platform
                                                           ↓
                                         Intelligent Assignment Engine
                                         (analyzes performance metrics)
                                                           ↓
                                    Assigns to Most Efficient Staff ←→ MongoDB
                                                           ↓
                                         Gmail Notifications Sent
                                         (to all stakeholders)
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0 or higher)
- **npm** or **pnpm** (latest version)
- **MongoDB Atlas account** or local MongoDB instance
- **Gmail account** (for email notifications - optional)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VSaini11/Issue-Tracking-web-app.git
   cd issue-tracking-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables (see [Environment Variables](#environment-variables) section)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# MongoDB Connection (Get your connection string from MongoDB Atlas)
# IMPORTANT: Never share or commit your MongoDB URI
MONGDB_URI="your-mongodb-connection-string"

# JWT Secret (use a strong random string in production)
JWT_SECRET="your-secret-key-here-change-in-production"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Gmail OAuth2 Configuration (Required for real-time notifications)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REFRESH_TOKEN="your-google-refresh-token"
EMAIL_USER="your-email@gmail.com"
```

> ⚠️ **Security Warning**: Never commit `.env.local` to version control or share your MongoDB URI publicly. Keep all credentials secure!

#### Getting Gmail OAuth2 Credentials (Optional)

If you want to enable email notifications:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Run the refresh token script:
   ```bash
   node scripts/get-refresh-token.js
   ```

### Database Setup

1. **MongoDB Atlas** (Recommended for production)
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string
   - Add it to `MONGODB_URI` in `.env.local`

2. **Seed the database** (Optional - for testing)
   ```bash
   npm run seed
   ```

   This will create sample users and issues for testing.

---

## 📁 Project Structure

```
issue-tracking-portal/
├── app/                          # Next.js App Router
│   ├── admin-dashboard/          # Admin dashboard pages
│   ├── client-dashboard/         # Client dashboard pages
│   ├── team-dashboard/           # Team dashboard pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── issues/               # Issue CRUD operations
│   │   ├── users/                # User management
│   │   └── staff/                # Team member queries
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing/Login page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components (49 components)
│   └── theme-provider.tsx        # Theme context provider
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts               # Authentication hook
│   └── ...
├── lib/                          # Utility libraries
│   ├── mongodb.ts                # MongoDB connection
│   ├── auth.ts                   # Auth utilities
│   └── utils.ts                  # Helper functions
├── models/                       # Mongoose schemas
│   ├── User.ts                   # User model
│   └── Issue.ts                  # Issue model
├── scripts/                      # Utility scripts
│   ├── seed.js                   # Database seeding
│   ├── cleanup-test-data.js      # Clean test data
│   ├── fix-legacy-users.js       # Migration scripts
│   ├── verify-users.js           # User verification
│   └── get-refresh-token.js      # Gmail OAuth setup
├── styles/                       # Additional styles
├── types/                        # TypeScript type definitions
├── middleware.ts                 # Auth middleware
├── .env.local                    # Environment variables (not in repo)
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project dependencies
```

---

## 👥 User Roles & Permissions

### Client (Employee Access)
**Use Case**: Regular employees who need to report issues

**Permissions**:
- ✅ Create new issues
- ✅ View own issues
- ✅ Add comments to own issues
- ✅ Update profile information
- ❌ Cannot view other users' issues
- ❌ Cannot assign issues
- ❌ Cannot access admin features

**Dashboard Features**:
- Personal issue tracker
- Submit new issue form
- Issue status overview
- Comment history

---

### Team Member (Technical Staff)
**Use Case**: Technical staff who resolve issues with intelligent automated assignment

**How Assignment Works**:
- Issues are **automatically assigned** by the Intelligent Assignment Engine
- Assignment is based on **priority-weighted performance metrics**:
  - Historical resolution time efficiency
  - Current workload capacity
  - Category expertise and specialization
  - Success rate on critical issues
  - Real-time availability status
- **Gmail notifications** sent immediately upon assignment

**Permissions**:
- ✅ View automatically assigned issues
- ✅ View all issues in their specialized categories
- ✅ Update issue status and priority
- ✅ Add comments and collaborate with team members
- ✅ Set due dates and track progress
- ✅ View personal performance metrics
- ❌ Cannot manually assign issues (automated by system)
- ❌ Cannot manage users
- ❌ Cannot access full system analytics

**Category Specialization**: During registration, team members select expertise areas:
- Infrastructure
- IT/Technical
- Portal
- HR
- Facilities
- Finance
- Security
- Operations
- Support
- Policy

**Dashboard Features**:
- Automatically assigned issue queue
- Category-filtered issue list
- Real-time status update interface
- Performance metrics dashboard showing:
  - Personal efficiency score
  - Average resolution time
  - Issue quality ratings
  - Workload capacity
- Collaboration and comment tools
- Gmail notification history

---

### Admin (System Administrator)
**Use Case**: System administrators with full access

**Permissions**:
- ✅ Full access to all issues
- ✅ Create, read, update, delete any issue
- ✅ User management (activate/deactivate)
- ✅ Assign issues to team members
- ✅ Access to all analytics and reports
- ✅ System configuration
- ✅ Audit trail access

**Dashboard Features**:
- Comprehensive analytics dashboard
- User management panel
- System-wide issue overview
- Advanced filtering and search
- Export capabilities
- Performance reports
- Trend analysis

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "client|team|admin",
  "name": "John Doe",
  "department": "IT/Technical",
  "categories": ["Infrastructure", "IT/Technical"]  // For team members only
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "role": "client",
    "name": "John Doe"
  }
}
```

---

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "role": "client",
    "name": "John Doe",
    "department": "IT/Technical"
  }
}
```

---

### Issue Endpoints

#### Create Issue
```http
POST /api/issues
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Server downtime in Building A",
  "description": "Main server in Building A is not responding",
  "category": "Infrastructure",
  "priority": "Critical",
  "tags": ["server", "urgent"]
}
```

---

#### Get All Issues
```http
GET /api/issues
Authorization: Bearer <token>
```

**Query Parameters**:
- `status`: Filter by status (Open, In Progress, Resolved, Closed)
- `category`: Filter by category
- `priority`: Filter by priority
- `assignedTo`: Filter by assigned user ID

---

#### Update Issue
```http
PATCH /api/issues/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Progress",
  "priority": "High",
  "assignedTo": "team-member-id"
}
```

---

#### Add Comment
```http
POST /api/issues/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Working on this issue now"
}
```

---

### User Endpoints

#### Get All Users (Admin only)
```http
GET /api/users
Authorization: Bearer <token>
```

---

#### Get Staff Members
```http
GET /api/staff
Authorization: Bearer <token>
```

Returns all team members with their assigned categories.

---

## 🔧 Scripts & Utilities

The project includes several utility scripts in the `/scripts` directory:

### Database Management

#### Seed Database
```bash
npm run seed
```
Creates sample users and issues for development/testing.

#### Cleanup Test Data
```bash
node scripts/cleanup-test-data.js
```
Removes all test data from the database.

---

### User Management

#### Fix Legacy Users
```bash
node scripts/fix-legacy-users.js
```
Migrates old user format to new schema.

#### Verify Users
```bash
node scripts/verify-users.js
```
Checks database for user data integrity.

#### Fix Production Users
```bash
node scripts/fix-production-users.js
```
Updates production user records with new fields.

---

### Email Configuration

#### Get Gmail Refresh Token
```bash
node scripts/get-refresh-token.js
```
Interactive script to obtain Gmail OAuth2 refresh token for email notifications.

---

### Testing Scripts

#### Verify Assignment
```bash
node scripts/verify-assignment.js
```
Checks issue assignment logic.

#### Seed Assignment Test
```bash
node scripts/seed-assignment-test.js
```
Creates test data for assignment workflow testing.

---

## 🌐 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Ensure `NEXTAUTH_URL` points to your production domain

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `your-project.vercel.app`

### Other Platforms

#### Manual Deployment
```bash
# Build the project
npm run build

# Start production server
npm start
```

#### Docker (Optional)
Create a `Dockerfile`:
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

Build and run:
```bash
docker build -t issue-tracker .
docker run -p 3000:3000 --env-file .env.local issue-tracker
```

---

## 🔒 Security

### Authentication & Authorization
- **JWT tokens** stored securely in httpOnly cookies
- **Password hashing** using bcryptjs (10 rounds)
- **Role-based access control** enforced at API level
- **Middleware protection** for all dashboard routes

### Best Practices Implemented
- ✅ Environment variables for sensitive data
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Mongoose
- ✅ XSS protection with React's built-in escaping
- ✅ CSRF protection via Next.js
- ✅ Rate limiting (configure as needed)

### Security Checklist for Production
- [ ] Use strong `JWT_SECRET` (min 32 characters)
- [ ] Enable HTTPS only in production
- [ ] Set secure cookie flags
- [ ] Implement rate limiting on auth endpoints
- [ ] Regular dependency updates
- [ ] Enable MongoDB IP whitelisting
- [ ] Use environment-specific configurations
- [ ] Implement audit logging
- [ ] Regular security audits

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact & Support

- **Author**: Vaibhav Saini
- **GitHub**: [@VSaini11](https://github.com/VSaini11)
- **Repository**: [Issue-Tracking-web-app](https://github.com/VSaini11/Issue-Tracking-web-app)

For bugs and feature requests, please [open an issue](https://github.com/VSaini11/Issue-Tracking-web-app/issues).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Radix UI](https://www.radix-ui.com/) - Primitive components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Hosting platform

---

<div align="center">
  <p>Built with ❤️ using Next.js and TypeScript</p>
  <p>© 2025 IssueTracker Pro. All rights reserved.</p>
</div>
