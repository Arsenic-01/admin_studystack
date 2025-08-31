# 🛠️ StudyStack Admin Panel

A dedicated administrative dashboard for managing StudyStack's educational content platform. This separated admin application provides comprehensive control over users, content, analytics, and system operations with enhanced security and specialized administrative tooling.

🔗 **Main StudyStack Repository:** [StudyStack](https://github.com/Arsenic-01/studystack)  
🔗 **Admin Panel Demo:** [Watch Demo](https://youtu.be/bcyYHZSmW88)

---

## 🎯 Admin Panel Overview

StudyStack Admin is a specialized dashboard designed exclusively for system administrators to manage the entire StudyStack ecosystem. Built as a separate application for enhanced security and performance, it provides comprehensive administrative capabilities without affecting the main student-facing application.

### 🔐 Why Separated Architecture?

- **Enhanced Security**: Admin functionalities are isolated from public access
- **Optimized Performance**: Dedicated resources for administrative operations
- **Specialized UI/UX**: Purpose-built interface for administrative workflows
- **Independent Deployment**: Can be updated and maintained separately
- **Role-based Access**: Strict authentication and authorization controls

---

## ✨ Core Admin Features

### 📊 **Dashboard & Analytics**

- **Real-time Statistics**: Live user counts, content metrics, and system health
- **Daily Active Users Chart**: Visual tracking of platform engagement
- **User Role Distribution**: Breakdown of students, teachers, and admins
- **Device Usage Analytics**: Desktop vs mobile usage patterns
- **Teacher Contribution Metrics**: Upload statistics and content analysis
- **Recent Activity Feed**: Live stream of platform activities

### 👥 **User Management**

- **Individual User Registration**: Create single user accounts with role assignment
- **Bulk CSV Import**: Import hundreds of users simultaneously from CSV files
- **Role Management**: Assign and modify user roles (Student, Teacher, Admin)
- **User Analytics**: Track user activity, login patterns, and engagement
- **Account Status Control**: Enable/disable user accounts as needed

### 📚 **Content Management**

- **Notes Administration**: View, edit, delete, and moderate all uploaded notes
- **Subject Management**: Create, update, and organize academic subjects
- **Link Management**: Manage YouTube videos, Google Forms, and external resources
- **File Type Filtering**: Advanced filtering by content type and creator
- **Batch Operations**: Bulk actions for efficient content management

### 🔗 **Link & Resource Management**

- **YouTube Integration**: Manage educational video content
- **Google Forms**: Handle quizzes, surveys, and assessment forms
- **External Links**: Organize and validate external educational resources
- **Content Categorization**: Advanced filtering and organization tools

### 🔍 **Advanced Search & Filtering**

- **Multi-parameter Search**: Search across titles, descriptions, and metadata
- **Real-time Filtering**: Instant results with debounced search
- **Teacher-based Filtering**: Filter content by uploading teacher
- **Date Range Filtering**: Time-based content analysis
- **Type-based Organization**: Filter by content types and categories

---

## 🏗️ Technical Architecture

### **Frontend Stack**

- **Next.js 15** (App Router) with React Server Components
- **TypeScript** for type safety and developer experience
- **Tailwind CSS** + **shadcn/ui** for consistent design system
- **Lucide Icons** for comprehensive iconography
- **React Hook Form** + **Zod** for robust form validation

### **Custom Hooks & State Management**

#### Admin Data Hooks (useAdminData.ts)

- `useAdminUsers()` - Infinite query for paginated user management
- `useAdminNotes()` - Notes with advanced filtering (type, teacher, search)
- `useAdminSubjects()` - Subject management with semester filtering
- `useAdminLinks()` - Unified YouTube and form link management
- `useDeleteUser()`, `useDeleteNote()`, `useDeleteLink()` - Mutation hooks with optimistic updates
- `useUpdateLink()` - Unified update handler for all link types
- `useInvalidateAdminQueries()` - Cache invalidation utilities

#### Performance Optimizations

- **Debounced Search**: 300ms delay to minimize API calls
- **Strategic Caching**: 5-minute stale time for admin queries
- **Optimistic Updates**: Immediate UI feedback for mutations
- **Query Invalidation**: Automatic cache refresh after mutations
- **Infinite Scroll**: Efficient pagination with `getNextPageParam`

#### Form Validation & UI

- **React Hook Form + Zod**: Type-safe form validation
- **Custom Error Handling**: User-friendly error messages
- **Loading States**: Skeleton loaders and disabled states during operations
- **Modal Management**: Controlled dialog states for CRUD operations

### **Data Fetching & Performance**

- **Server-side Pagination** with infinite scroll
- **Debounced Search** to minimize API calls
- **Strategic Caching** with staleTime optimization
- **Skeleton Loading** for smooth user experience
- **Error Boundaries** for graceful error handling

### **Authentication & Security Implementation**

#### NextAuth Configuration

- **Admin-only Authentication**: Restricts login to users with `role: "admin"`
- **Credential-based Login**: PRN number and password authentication
- **Bcrypt Password Hashing**: Secure password storage with salt rounds
- **JWT Session Strategy**: Stateless session management
- **Session Callbacks**: Custom JWT and session data handling

#### Security Features

- **Password Change API**: Current password verification before updates
- **Input Validation**: Zod schemas for all form inputs and API endpoints
- **SQL Injection Prevention**: Appwrite Query builder for safe database operations
- **CSRF Protection**: Built-in NextAuth CSRF tokens
- **Environment Variable Security**: Secure handling of API keys and secrets

#### Google Drive Authentication

- **OAuth2 Token Management**: Automated token refresh with locking mechanism
- **Token Expiry Handling**: 5-minute buffer before expiry with automatic renewal
- **Concurrent Request Protection**: Lock-based system prevents multiple refresh attempts
- **Fallback Mechanisms**: Graceful degradation on authentication failures

---

## 📱 Admin Interface Components

### **Dashboard Layout**

```
📊 Admin Dashboard
├── 📈 Statistics Cards (Users, Notes, Links, Subjects)
├── 📊 Daily Active Users Chart
├── 🥧 User Role Distribution Chart
├── 📋 Recent Activity Feed
├── 👑 Top Users List
├── 📱 Device Usage Analytics
└── 👨‍🏫 Teacher Contribution Chart
```

### **Management Pages**

- **`/admin`** - Main dashboard with analytics and overview
- **`/admin/users`** - User management and analytics
- **`/admin/notes`** - Content management for study materials
- **`/admin/subjects`** - Academic subject organization
- **`/admin/links`** - YouTube and form resource management
- **`/admin/register`** - Single and bulk user registration

---

## ⚙️ Environment Configuration

Create a `.env.local` file with admin-specific configurations:

### Core Admin Settings

```env
# Admin Authentication
NEXTAUTH_URL=your_admin_panel_url
NEXTAUTH_SECRET=your_admin_secret

# Database Configuration
PROJECT_ID=your_appwrite_project_id
API_KEY=your_appwrite_admin_api_key
DATABASE_ID=your_database_id

# Collection IDs
USER_COLLECTION_ID=your_users_collection
NOTE_COLLECTION_ID=your_notes_collection
SUBJECT_COLLECTION_ID=your_subjects_collection
YOUTUBE_COLLECTION_ID=your_youtube_collection
FORM_COLLECTION_ID=your_forms_collection
CACHE_COLLECTION_ID=your_cache_collection

# Analytics & Monitoring
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host

# Cloud Functions
APPWRITE_ACTIVITY_FUNC_ID=your_function_id
STATS_DOCUMENT_ID=your_stats_doc_id

# Google Drive Integration
GOOGLE_REFRESH_TOKEN_COLLECTION_ID=your_refresh_token_collection
GOOGLE_DRIVE_TOKEN_DOC_ID=your_token_document_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Cache Revalidation Function
NEXT_PUBLIC_REVALIDATION_TOKEN=your_revalidation_token
NEXT_PUBLIC_MAIN_APP_URL=your_app_url

# App Configuration
NEXT_PUBLIC_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_BASE_URL=your_deployed_app_url

```

---

## 🚀 Quick Setup

### Prerequisites

- Node.js 18+
- Access to Appwrite admin API keys
- Admin credentials for the main StudyStack system

### Installation

1️⃣ **Clone the Admin Repository**

```bash
git clone https://github.com/Arsenic-01/studystack-admin.git
cd studystack-admin
```

2️⃣ **Install Dependencies**

```bash
npm install
```

3️⃣ **Environment Setup**

```bash
cp .env.example .env.local
# Configure all admin-specific environment variables
```

4️⃣ **Database Permissions**

- Ensure admin API key has full read/write permissions
- Configure collection-level permissions for admin operations
- Set up proper indexing for admin queries

5️⃣ **Run Development Server**

```bash
npm run dev
```

Access the admin panel at `http://localhost:3000`

---

## 🔧 Admin Operations Guide

### **User Registration Methods**

#### Single User Registration

1. Navigate to `/admin/register`
2. Fill in user details (PRN, name, email, password, role)
3. Submit to create individual accounts

#### Bulk CSV Import

1. Download the CSV template from the registration page
2. Fill in user data following the format:
   ```csv
   prnNo,name,email,password,role
   1234567890,John Doe,john.doe@example.com,password123,student
   ```
3. Upload the CSV file for batch registration

### **Content Management Workflow**

#### Notes Management

- **View**: Browse all uploaded notes with pagination
- **Filter**: By type, teacher, subject, or date range
- **Edit**: Modify note metadata and descriptions
- **Delete**: Remove notes and associated files
- **Bulk Actions**: Manage multiple notes simultaneously

#### Subject Administration

- **Create**: Add new academic subjects with details
- **Edit**: Update subject information and unit structure
- **Delete**: Remove subjects (with content dependency checks)
- **Filter**: By semester and search terms

### **Analytics & Monitoring**

#### Dashboard Metrics

- Real-time user activity tracking
- Content upload and download statistics
- Teacher contribution analysis
- Device usage patterns
- System health monitoring

#### Activity Monitoring

- Recent user actions and content changes
- Upload and download tracking
- User engagement metrics
- System performance indicators

---

## 🛡️ Security Features

### **Access Control**

- **Admin-only Authentication**: Strict login requirements
- **Role-based Permissions**: Granular access control
- **Session Validation**: Automatic token verification
- **API Security**: Protected endpoints with authorization

### **Data Protection**

- **Encrypted Connections**: HTTPS enforced
- **Secure Headers**: CSP and security headers configured
- **Input Validation**: Comprehensive form and API validation
- **Error Handling**: Secure error messages without data exposure

### **Audit Trail**

- **Action Logging**: Track all administrative actions
- **User Activity**: Monitor admin user behavior
- **Change History**: Record all content modifications
- **Security Events**: Log authentication and authorization events

---

## 📊 Performance Optimization

### **Frontend Performance**

- **Server-side Rendering**: Fast initial page loads
- **Code Splitting**: Optimized bundle sizes
- **Image Optimization**: Next.js automatic optimization
- **Caching Strategy**: Strategic browser and API caching

### **Backend Optimization**

- **Pagination**: Efficient data loading with limits
- **Indexing**: Optimized database queries
- **Caching**: Server-side response caching
- **Compression**: Gzipped responses for faster transfers

---

## 🧪 Development & Testing

### **Development Workflow**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### **Code Quality**

- **TypeScript**: Full type coverage
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

---

## 📈 Monitoring & Analytics

### **Built-in Analytics**

- User engagement tracking with PostHog
- Performance monitoring with Next.js analytics
- Real-time dashboard metrics
- Custom admin action tracking

### **Health Monitoring**

- Database connection status
- API response times
- Error rate tracking
- System resource usage

---

## 🚢 Deployment

### **Vercel Deployment** (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### **Docker Deployment**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Variables Setup**

Configure all admin environment variables in your deployment platform:

- Database credentials
- Authentication secrets
- Analytics keys
- External service tokens

---

## 🤝 Contributing to Admin Panel

### **Development Guidelines**

- Follow TypeScript best practices
- Use existing UI components from shadcn/ui
- Implement proper error handling
- Add loading states for all async operations
- Test admin workflows thoroughly

### **Pull Request Process**

1. Fork the admin repository
2. Create a feature branch: `git checkout -b feature/admin-enhancement`
3. Implement changes with proper TypeScript types
4. Test all admin functionalities
5. Submit PR with detailed description

---

## 📋 Admin API Endpoints & Architecture

### **Authentication & Session Management**

- `POST /api/auth/[...nextauth]` - NextAuth authentication (admin-only access)
- `POST /api/change-password` - Change admin password with current password verification
- Session validation with automatic JWT token management

### **User Management**

- `POST /api/register` - Create single user with role assignment
- `importUsersFromCsv()` - Server action for bulk CSV import with validation
- Built-in duplicate detection and password hashing

### **Content Management APIs**

#### Notes Management

- Server actions for CRUD operations:
  - `editNotes()` - Update note metadata (title, description, type)
  - `deleteNote()` - Delete note and associated Google Drive file
- Real-time cache invalidation with TanStack Query

#### Links Management

- YouTube Links:
  - `editYoutubeLink()` - Update YouTube video title and URL
  - `deleteYoutubeLink()` - Remove YouTube video links
- Form Links:
  - `editFormLink()` - Update form details and type
  - `deleteFormLink()` - Remove form links
- Unified API handling for both link types

#### Subjects Management

- `createSubject()` - Add new academic subjects with units
- `updateSubject()` - Modify subject information
- `deleteSubject()` - Remove subjects with dependency checks
- Automatic cache revalidation trigger to main app

### **Analytics & Monitoring APIs**

#### Dashboard Statistics

- `GET /api/admin/stats/teacher-contributions` - Teacher upload statistics
- `fetchAdminDashboardStats()` - Real-time dashboard metrics
- `fetchRecentActivity()` - Activity feed via Appwrite Functions

#### PostHog Integration

- `GET /api/admin/trends/daily-active-users` - 7-day active user trends
- `GET /api/admin/trends/device-users` - Desktop vs mobile usage analytics
- `GET /api/admin/trends/top-pages` - Most visited pages (excluding admin)
- `GET /api/admin/trends/top-users` - Most active users by pageviews
- `GET /api/admin/user-sessions/[userId]` - Individual user session tracking

### **Data Fetching Architecture**

#### Server-side Pagination

- `fetchPaginatedUsers()` - Users with role and search filtering
- `fetchPaginatedNotesForAdmin()` - Notes with type and teacher filtering
- `fetchPaginatedLinksForAdmin()` - Combined YouTube and form links
- `fetchPaginatedSubjects()` - Subjects with semester filtering

#### Caching & Performance

- Uploader cache with `getUploaderOptions()` for filter dropdowns
- Teacher statistics cache with pre-calculated contributions
- Strategic stale-time configuration for optimal performance

---

## 🔒 Admin Security Checklist

- [ ] Admin credentials are secure and rotated regularly
- [ ] All API endpoints require admin authentication
- [ ] Input validation is implemented on all forms
- [ ] Error messages don't expose sensitive information
- [ ] HTTPS is enforced in production
- [ ] Database queries use proper indexing
- [ ] File uploads have size and type restrictions
- [ ] Session timeouts are configured appropriately

---

## 📞 Support & Maintenance

### **Admin Issues**

For admin panel specific issues:

- Check server logs for error details
- Verify database connectivity
- Confirm API key permissions
- Review environment configuration

### **Contact Information**

📧 **Technical Support**: [vedbhor25@gmail.com](mailto:vedbhor25@gmail.com)  
🐛 **Bug Reports**: [GitHub Issues](https://github.com/Arsenic-01/studystack-admin/issues)  
💼 **LinkedIn**: [Vedant Bhor](https://www.linkedin.com/in/vedant-bhor-39287828b/)

---

## 📜 License

Copyright (c) 2024-present, **Vedant Bhor**.

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

---

_Built with precision for educational administration_ 🎓
