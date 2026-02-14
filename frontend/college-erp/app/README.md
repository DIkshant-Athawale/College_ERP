# College ERP System

A complete frontend College ERP System with authentication and role-based routing built with React, TypeScript, and Tailwind CSS.

## 🚀 Live Demo

**URL**: https://smxdnawuapxkm.ok.kimi.link

## 📋 Demo Credentials

Use these credentials to test different roles:

| Role   | Email                   | Password    |
|--------|------------------------ |-------------|
| Student| `student@college.edu`   | `student123`|
| Teacher| `teacher@college.edu`   | `teacher123`|
| Admin  | `admin@college.edu`     | `admin123`  |

## ✨ Features

### Authentication Flow
- JWT-based authentication with Access Token + Refresh Token
- HTTP-only secure cookies for refresh token
- Automatic token refresh on expiry
- Protected routes with role-based access control

### Role-Based Routing
- **Student** → `/student/dashboard`
- **Teacher** → `/teacher/dashboard`
- **Admin** → `/admin/dashboard`

### Student Dashboard
- **Profile Card**: Student information with avatar, year, semester
- **Subjects List**: Enrolled courses with course codes
- **Attendance Table**: Subject-wise and overall attendance with visual indicators
- **Fee Summary**: Total, paid, and remaining fee with payment status
- **Weekly Timetable**: Day-wise class schedule with teacher names

### Admin Dashboard
- Statistics cards (Students, Teachers, Courses, Departments)
- Recent activity feed
- Quick navigation sidebar

### Teacher Dashboard
- Profile information
- My Courses list with student counts
- Weekly schedule view

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui (40+ components)
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Build Tool**: Vite 7

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Dashboard reusable components
│   │   ├── ProfileCard.tsx
│   │   ├── SubjectsList.tsx
│   │   ├── AttendanceTable.tsx
│   │   ├── FeeSummary.tsx
│   │   └── WeeklyTimetable.tsx
│   └── ProtectedRoute.tsx  # Route protection component
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── pages/
│   ├── Login.tsx           # Login page
│   ├── StudentDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── TeacherDashboard.tsx
├── services/
│   ├── api.ts              # Axios instance with interceptors
│   └── mockApi.ts          # Mock API for demo
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Main app with routing
└── main.tsx               # Entry point
```

## 🔧 Installation & Setup

```bash
# Clone the repository
git clone <repo-url>
cd college-erp

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔌 Backend Integration

The frontend is designed to work with your friend's backend. To connect:

1. Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://your-backend-url/api';
```

2. The API service expects these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Login with email/password |
| POST | `/login/refresh` | Refresh access token |
| POST | `/login/logout` | Logout and clear cookies |
| GET | `/student/dashboard` | Get student dashboard data |
| GET | `/admin/dashboard` | Get admin dashboard data |
| GET | `/teacher/dashboard` | Get teacher dashboard data |

### Expected Response Formats

**POST /login**
```json
{
  "accessToken": "jwt-access-token",
  "role": "admin | student | teacher",
  "userType": "faculty | student"
}
```

**GET /student/dashboard**
```json
{
  "profile": {
    "student_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "year": 3,
    "semester": 6,
    "department_id": 2,
    "academic_year": "2025-2026"
  },
  "subjects": [...],
  "attendance_by_subject": [...],
  "overall_attendance": {...},
  "feeRecord": [...],
  "timetablerows": [...]
}
```

## 🔐 Security Features

- JWT tokens stored in localStorage (access token)
- HTTP-only secure cookies for refresh token
- Automatic token refresh on 401 responses
- Protected routes prevent unauthorized access
- Role-based access control

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-friendly navigation with hamburger menu
- Responsive grid layouts
- Touch-friendly UI components
- Optimized for all screen sizes

## 🎨 Customization

### Colors & Theme

Edit `tailwind.config.js` to customize the theme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      // Add custom colors
    },
  },
}
```

### Adding New API Endpoints

Add new API functions in `src/services/api.ts`:

```typescript
export const studentApi = {
  getDashboard: async () => { ... },
  getGrades: async () => {
    const response = await api.get('/student/grades');
    return response.data;
  },
};
```

## 📄 License

MIT License - feel free to use for your college projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
