# Issue Tracking Portal

A comprehensive enterprise issue management system built with Next.js, MongoDB, and TypeScript. This system provides robust user management with role-based access control, complete issue lifecycle management, and advanced user activation/deactivation capabilities.

## 🚀 Features

### Core Functionality
- **Advanced User Management**: Complete user lifecycle with activate/deactivate functionality
- **Role-based Access Control**: Client, Team, and Admin roles with granular permissions
- **Real-time Issue Tracking**: Create, update, and monitor issues with status tracking
- **Secure Authentication**: JWT-based authentication with Edge Runtime compatibility
- **Professional UI**: Modern interface built with Tailwind CSS and Radix UI components

### Admin Features
- **User Status Management**: Activate/deactivate users without data loss
- **Complete User Visibility**: View both active and inactive users
- **Smart Issue Cleanup**: Automatic unassignment when users are deactivated
- **Secure Dashboard**: Admin-only access with JWT verification

### Security & Performance
- **Edge Runtime Compatible**: Optimized for serverless deployment
- **HTTP-only Cookies**: Secure token storage
- **Middleware Protection**: Route-level security enforcement
- **Password Hashing**: bcrypt encryption for user credentials

## 🏗️ System Architecture

### Database Design & ER Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string email UK "Unique email address"
        string password "Hashed with bcrypt"
        enum role "client|team|admin"
        string name "Full name"
        string department "User department"
        boolean isActive "Account status"
        Date createdAt "Account creation"
        Date updatedAt "Last modification"
    }
    
    ISSUE {
        ObjectId _id PK
        string title "Issue title"
        string description "Detailed description"
        enum category "Infrastructure|IT/Technical|Portal"
        enum priority "Low|Medium|High|Critical"
        enum status "Open|In Progress|Resolved|Closed"
        ObjectId createdBy FK "Issue creator"
        ObjectId assignedTo FK "Assigned team member"
        Date dueDate "Target resolution date"
        array tags "Classification tags"
        Date createdAt "Issue creation"
        Date updatedAt "Last modification"
    }
    
    COMMENT {
        ObjectId _id PK
        ObjectId issueId FK "Parent issue"
        ObjectId userId FK "Comment author"
        string content "Comment text"
        Date createdAt "Comment timestamp"
    }

    USER ||--o{ ISSUE : "creates (createdBy)"
    USER ||--o{ ISSUE : "assigned to (assignedTo)"
    USER ||--o{ COMMENT : "authors"
    ISSUE ||--o{ COMMENT : "contains"
```

### Component Architecture

```mermaid
graph TB
    A[Next.js App Router] --> B[Layout Components]
    A --> C[Page Components]
    A --> D[API Routes]
    
    B --> E[Navigation]
    B --> F[Theme Provider]
    
    C --> G[Client Dashboard]
    C --> H[Team Dashboard]
    C --> I[Admin Dashboard]
    
    I --> J[User Management]
    I --> K[Issue Management]
    
    D --> L[Auth API]
    D --> M[Users API]
    D --> N[Issues API]
    
    L --> O[JWT Middleware]
    M --> O
    N --> O
    
    O --> P[MongoDB/Mongoose]
    
    J --> Q[Activate/Deactivate Users]
    J --> R[View All Users]
    
    Q --> S[Confirmation Dialogs]
    Q --> T[Status Toggle Logic]
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js with Edge Runtime compatibility
- **API**: Next.js API Routes
- **Authentication**: JWT with HTTP-only cookies
- **Middleware**: Route protection and authentication
- **Validation**: Built-in TypeScript validation

### Database
- **Database**: MongoDB
- **ODM**: Mongoose
- **Schema**: Defined models with relationships
- **Indexing**: Optimized queries for performance

### Development Tools
- **Package Manager**: pnpm (recommended)
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler
- **Development**: Hot reload and fast refresh

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running locally or MongoDB Atlas account
- pnpm package manager (recommended) or npm

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/issue-tracker

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
```

### 3. Database Setup

Make sure MongoDB is running, then seed the database with initial users:

```bash
pnpm run seed
```

This will create three default users:
- **Admin**: admin@company.com / admin123
- **Team**: team@company.com / team123  
- **Client**: client@company.com / client123

### 4. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to access the application.

## 📋 User Roles & Permissions Matrix

| Feature | Client | Team | Admin |
|---------|--------|------|-------|
| **Authentication** |
| Login/Logout | ✅ | ✅ | ✅ |
| View Profile | ✅ | ✅ | ✅ |
| **Issue Management** |
| Create Issues | ✅ | ✅ | ✅ |
| View Own Issues | ✅ | ❌ | ✅ |
| View All Issues | ❌ | ✅ | ✅ |
| Update Issue Status | ❌ | ✅ | ✅ |
| Assign Issues | ❌ | ✅ | ✅ |
| Delete Issues | ❌ | ❌ | ✅ |
| **User Management** |
| View Users List | ❌ | ✅ | ✅ |
| Activate/Deactivate Users | ❌ | ❌ | ✅ |
| View Inactive Users | ❌ | ❌ | ✅ |
| User Status Management | ❌ | ❌ | ✅ |

### Role Descriptions

#### 👤 Client Role
- **Primary Purpose**: Issue reporting and tracking personal issues
- **Dashboard Access**: Client-specific dashboard with personal issues
- **Permissions**:
  - Create new issues with full details
  - View and update their own issues only
  - Modify limited fields (title, description, priority)
  - Cannot assign issues or change status beyond creation

#### 👥 Team Role
- **Primary Purpose**: Issue resolution and team collaboration
- **Dashboard Access**: Team dashboard with all active issues
- **Permissions**:
  - View all issues across the organization
  - Update issue status and assignments
  - Assign issues to team members
  - Collaborate on issue resolution
  - Cannot delete issues or manage users

#### 🔐 Admin Role
- **Primary Purpose**: System administration and user management
- **Dashboard Access**: Admin dashboard with complete system control
- **Permissions**:
  - **Full Issue Management**: Create, read, update, delete all issues
  - **User Lifecycle Management**: 
    - Activate/deactivate user accounts
    - View both active and inactive users
    - Smart issue cleanup when deactivating users
  - **System Administration**: Complete control over all system features
  - **Security Management**: Access to all protected endpoints

## 🔌 API Endpoints Documentation

### Authentication Endpoints
```typescript
// User login with email and password
POST /api/auth/login
Body: { email: string, password: string }
Response: { success: boolean, user: UserData } + HTTP-only cookie

// User registration (if registration is enabled)
POST /api/auth/register  
Body: { email: string, password: string, name: string, role: string }
Response: { success: boolean, user: UserData }

// User logout (clears authentication cookie)
POST /api/auth/logout
Response: { success: boolean }

// Get current authenticated user information
GET /api/auth/me
Headers: Cookie (JWT token)
Response: { user: UserData }
```

### User Management Endpoints
```typescript
// Get all users (team/admin access required)
GET /api/users
Headers: Cookie (JWT token)
Response: { users: UserData[] }
Note: Returns both active and inactive users for admin visibility

// Toggle user activation status (admin only)
DELETE /api/users/[id]
Headers: Cookie (JWT token)
Response: { success: boolean, user: UserData, action: 'activated' | 'deactivated' }
Note: Automatically unassigns user from issues when deactivating
```

### Issue Management Endpoints
```typescript
// Get issues (filtered by user role)
GET /api/issues
Headers: Cookie (JWT token)
Query: { status?, priority?, assignedTo?, page?, limit? }
Response: { issues: IssueData[], total: number }

// Create new issue
POST /api/issues
Headers: Cookie (JWT token)
Body: { title: string, description: string, category: string, priority: string }
Response: { success: boolean, issue: IssueData }

// Update existing issue
PUT /api/issues/[id]
Headers: Cookie (JWT token)  
Body: { title?, description?, status?, priority?, assignedTo? }
Response: { success: boolean, issue: IssueData }

// Delete issue (admin only)
DELETE /api/issues/[id]
Headers: Cookie (JWT token)
Response: { success: boolean }
```

### Response Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions or deactivated user)
- `404` - Resource not found
- `500` - Internal server error

## 🗄️ Database Schema

### User Model
```typescript
interface User {
  _id: ObjectId;              // Primary key
  email: string;              // Unique identifier, used for login
  password: string;           // Hashed with bcrypt (12 rounds)
  role: 'client' | 'team' | 'admin';  // Role-based access control
  name: string;               // Full display name
  department: string;         // Organizational department
  isActive: boolean;          // Account activation status
  createdAt: Date;           // Account creation timestamp
  updatedAt: Date;           // Last modification timestamp
}

// Indexes:
// - email: unique index for fast lookup and uniqueness constraint
// - role: compound index for role-based queries
// - isActive: index for filtering active/inactive users
```

### Issue Model
```typescript
interface Issue {
  _id: ObjectId;              // Primary key
  title: string;              // Issue summary
  description: string;        // Detailed issue description
  category: 'Infrastructure' | 'IT/Technical' | 'Portal';  // Issue classification
  priority: 'Low' | 'Medium' | 'High' | 'Critical';       // Priority level
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'; // Current status
  createdBy: ObjectId;        // Reference to User._id (issue creator)
  assignedTo?: ObjectId;      // Reference to User._id (assigned team member)
  dueDate?: Date;            // Target resolution date
  tags: string[];            // Flexible tagging system
  comments: Comment[];       // Embedded comments array
  createdAt: Date;          // Issue creation timestamp
  updatedAt: Date;          // Last modification timestamp
}

// Indexes:
// - createdBy: index for user-specific issue queries
// - assignedTo: index for assignment-based queries  
// - status: index for status filtering
// - priority: compound index for priority-based sorting
// - createdAt: index for chronological sorting
```

### Comment Schema (Embedded)
```typescript
interface Comment {
  _id: ObjectId;              // Comment identifier
  userId: ObjectId;           // Reference to User._id (comment author)
  content: string;            // Comment text content
  createdAt: Date;           // Comment timestamp
}
```

### Relationships
- **User → Issues (One-to-Many)**: A user can create multiple issues (`createdBy`)
- **User → Issues (One-to-Many)**: A user can be assigned multiple issues (`assignedTo`)
- **Issue → Comments (One-to-Many)**: An issue can have multiple comments (embedded)
- **User → Comments (One-to-Many)**: A user can author multiple comments

### Data Integrity Rules
1. **User Deactivation**: When a user is deactivated (`isActive: false`):
   - User is automatically unassigned from all assigned issues
   - User cannot login (403 Forbidden response)
   - Historical data (created issues, comments) is preserved
   
2. **Referential Integrity**: 
   - `createdBy` always references valid User._id
   - `assignedTo` references only active users with 'team' or 'admin' roles
   - Comment `userId` references valid User._id

3. **Business Rules**:
   - Only active users can be assigned to issues
   - Only 'team' and 'admin' roles can be assigned issues
   - Issue status transitions follow business logic
   - Admin users have override capabilities

## 🔒 Security Features

### Authentication & Authorization
- **JWT Token Authentication**: Secure token-based authentication system
- **Edge Runtime Compatible**: Optimized for serverless and edge deployments
- **HTTP-only Cookies**: Tokens stored in secure, HTTP-only cookies to prevent XSS
- **Role-based Access Control**: Granular permissions based on user roles
- **Route Protection**: Middleware-level protection for sensitive endpoints

### Password Security
- **bcrypt Hashing**: Passwords hashed with bcrypt (12 rounds)
- **Salt Generation**: Unique salt for each password
- **No Plain Text Storage**: Passwords never stored in plain text

### API Security
- **Request Validation**: Input validation and sanitization
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Rate Limiting**: Protection against brute force attacks
- **Error Handling**: Secure error messages without sensitive information

### User Account Security
- **Account Deactivation**: Secure user lifecycle management
  - Deactivated users cannot login (403 response)
  - Automatic cleanup of user assignments
  - Data preservation for audit trails
- **Session Management**: Secure session handling with JWT expiration

## 🚀 Deployment Guide

### Environment Variables
Create production environment configuration:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/production-db

# Security Keys (Generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-minimum-32-characters

# Application Configuration  
NEXTAUTH_URL=https://your-production-domain.com
NODE_ENV=production

# Optional: Enhanced Security
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
```

### Build & Deploy Process

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server
pnpm start
```

### Production Checklist
- [ ] **Database**: MongoDB Atlas or production MongoDB instance configured
- [ ] **Environment Variables**: All production variables set securely
- [ ] **SSL Certificate**: HTTPS enabled for secure cookie transmission
- [ ] **Domain Configuration**: NEXTAUTH_URL points to production domain
- [ ] **Security Headers**: Additional security headers configured
- [ ] **Monitoring**: Error tracking and performance monitoring setup
- [ ] **Backups**: Database backup strategy implemented

### Recommended Hosting Platforms
- **Vercel**: Optimized for Next.js with edge deployment
- **Netlify**: Easy deployment with continuous integration
- **Digital Ocean**: Full control with App Platform or Droplets
- **AWS**: Scalable deployment with multiple service options

## 🎯 Key Features Deep Dive

### User Management System
The system implements a sophisticated user lifecycle management approach:

#### Activate/Deactivate Functionality
- **Smart Toggle System**: Instead of destructive deletion, users are activated/deactivated
- **Data Preservation**: All user data, issues, and comments are preserved
- **Automatic Cleanup**: When deactivating users:
  - User is unassigned from all current issues
  - Login attempts return 403 Forbidden
  - Historical data remains intact for audit purposes
- **Admin Dashboard**: Visual indicators show user status with intuitive icons
  - 🟢 **UserCheck**: Activate deactivated users
  - 🔴 **UserX**: Deactivate active users

#### Security Implementation
```typescript
// Example: User deactivation logic
const toggleUserStatus = async (userId: string) => {
  const user = await User.findById(userId);
  const newStatus = !user.isActive;
  
  // Update user status
  await User.findByIdAndUpdate(userId, { isActive: newStatus });
  
  // If deactivating, unassign from all issues
  if (!newStatus) {
    await Issue.updateMany(
      { assignedTo: userId },
      { $unset: { assignedTo: "" } }
    );
  }
};
```

### Role-Based Access Control
The system implements three distinct user roles with specific permissions:

#### Middleware Protection
```typescript
// Route protection example
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const user = verifyJWT(token);
  
  // Block deactivated users
  if (!user.isActive) {
    return new Response('Account deactivated', { status: 403 });
  }
  
  // Role-based route protection
  if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'admin') {
    return new Response('Unauthorized', { status: 403 });
  }
}
```

### Issue Lifecycle Management
Issues follow a complete lifecycle with role-based state transitions:

1. **Creation**: Clients create issues with full details
2. **Assignment**: Team/Admin assign to appropriate team members  
3. **Progress Tracking**: Status updates through workflow stages
4. **Resolution**: Issue closure with resolution details
5. **Audit Trail**: Complete history of changes and comments

## 🔧 Development Guide

### Project Structure
```
issue-tracking-portal/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Landing page
│   ├── admin-dashboard/         # Admin-specific pages
│   ├── client-dashboard/        # Client-specific pages
│   ├── team-dashboard/          # Team-specific pages
│   └── api/                     # API routes
│       ├── auth/                # Authentication endpoints
│       ├── users/               # User management endpoints
│       └── issues/              # Issue management endpoints
├── components/                   # Reusable UI components
│   ├── ui/                      # Radix UI components (shadcn/ui)
│   └── theme-provider.tsx       # Theme management
├── lib/                         # Utility libraries
│   └── utils.ts                 # Helper functions
├── hooks/                       # Custom React hooks
├── models/                      # MongoDB/Mongoose models
└── middleware.ts                # Route protection middleware
```

### Adding New Features

#### 1. Database Schema Changes
```typescript
// Update models in /models directory
// Run migration scripts if needed
// Update TypeScript interfaces
```

#### 2. API Endpoint Creation
```typescript
// Create new route in /app/api/[feature]/route.ts
// Implement proper authentication and authorization
// Add input validation and error handling
```

#### 3. UI Component Development
```typescript
// Create reusable components in /components
// Follow existing design patterns
// Implement proper TypeScript typing
```

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user workflow testing
- **Security Tests**: Authentication and authorization testing

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `pnpm install`
4. Set up environment variables
5. Start development server: `pnpm dev`

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting for consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit pull request with detailed description

## 📊 Performance & Monitoring

### Performance Optimizations
- **Edge Runtime**: API routes optimized for edge deployment
- **Static Generation**: Pages pre-rendered where possible
- **Database Indexing**: Optimized queries with proper indexes
- **Component Optimization**: React.memo and useMemo for expensive operations

### Monitoring Recommendations
- **Error Tracking**: Sentry or similar error monitoring
- **Performance Monitoring**: Web Vitals tracking
- **Database Monitoring**: MongoDB Atlas monitoring
- **User Analytics**: Understanding user behavior patterns

## 📞 Support & Maintenance

### Common Issues & Solutions
1. **Authentication Problems**: Check JWT secret and cookie configuration
2. **Database Connection**: Verify MongoDB URI and network access
3. **Role Permissions**: Ensure proper role assignment and middleware protection
4. **User Activation**: Verify user status and proper deactivation handling

### Maintenance Tasks
- Regular security updates
- Database performance optimization
- User account cleanup (if needed)
- System monitoring and alerting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
