# 🛠️ Tech Stack — College ERP Frontend

> **Last Updated:** February 2026

---

## 📌 Overview

This is a **Single Page Application (SPA)** for a College ERP system, built with **React 19**, **TypeScript 5.9**, and **Vite 7**. It features role-based dashboards (Admin, Student, Faculty), a comprehensive UI component library via **shadcn/ui**, and communicates with a backend API over HTTP using **Axios**.

---

## 🏗️ Core Framework & Language

| Technology | Version | Purpose |
|---|---|---|
| **React** | `^19.2.0` | UI library (functional components, hooks) |
| **React DOM** | `^19.2.0` | DOM rendering engine |
| **TypeScript** | `~5.9.3` | Static typing, type safety across the codebase |
| **Vite** | `^7.2.4` | Build tool & dev server (ESM-based, HMR) |
| **@vitejs/plugin-react** | `^5.1.1` | React Fast Refresh & JSX transform for Vite |

### TypeScript Configuration
- **Target:** ES2022
- **Module:** ESNext with Bundler resolution
- **Strict mode** enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **Path aliases:** `@/*` → `./src/*`

---

## 🎨 Styling & Design System

| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | `^3.4.19` | Utility-first CSS framework |
| **tailwindcss-animate** | `^1.0.7` | Animation utilities for Tailwind |
| **tw-animate-css** | `^1.4.0` | Additional CSS animations |
| **PostCSS** | `^8.5.6` | CSS processing pipeline |
| **Autoprefixer** | `^10.4.23` | Vendor prefix automation |

### Tailwind Configuration
- **Dark mode:** Class-based (`darkMode: ["class"]`)
- **CSS Variables:** HSL-based design tokens for theming (`--primary`, `--background`, `--foreground`, etc.)
- **Custom animations:** `accordion-down`, `accordion-up`, `caret-blink`
- **Extended design tokens:** Sidebar-specific colors, custom border radii, custom box shadows

---

## 🧩 UI Component Library — shadcn/ui

**Style:** `new-york` · **Icon Library:** `lucide-react` · **CSS Variables:** Enabled · **Base Color:** `slate`

The project uses [shadcn/ui](https://ui.shadcn.com/) — a collection of re-usable components built on **Radix UI** primitives. **53 UI component files** are present in `src/components/ui/`:

<details>
<summary><strong>Full Component List (53 components)</strong></summary>

| Component | File |
|---|---|
| Accordion | `accordion.tsx` |
| Alert | `alert.tsx` |
| Alert Dialog | `alert-dialog.tsx` |
| Aspect Ratio | `aspect-ratio.tsx` |
| Avatar | `avatar.tsx` |
| Badge | `badge.tsx` |
| Breadcrumb | `breadcrumb.tsx` |
| Button | `button.tsx` |
| Button Group | `button-group.tsx` |
| Calendar | `calendar.tsx` |
| Card | `card.tsx` |
| Carousel | `carousel.tsx` |
| Chart | `chart.tsx` |
| Checkbox | `checkbox.tsx` |
| Collapsible | `collapsible.tsx` |
| Command | `command.tsx` |
| Context Menu | `context-menu.tsx` |
| Dialog | `dialog.tsx` |
| Drawer | `drawer.tsx` |
| Dropdown Menu | `dropdown-menu.tsx` |
| Empty | `empty.tsx` |
| Field | `field.tsx` |
| Form | `form.tsx` |
| Hover Card | `hover-card.tsx` |
| Input | `input.tsx` |
| Input Group | `input-group.tsx` |
| Input OTP | `input-otp.tsx` |
| Item | `item.tsx` |
| Kbd | `kbd.tsx` |
| Label | `label.tsx` |
| Menubar | `menubar.tsx` |
| Navigation Menu | `navigation-menu.tsx` |
| Pagination | `pagination.tsx` |
| Popover | `popover.tsx` |
| Progress | `progress.tsx` |
| Radio Group | `radio-group.tsx` |
| Resizable | `resizable.tsx` |
| Scroll Area | `scroll-area.tsx` |
| Select | `select.tsx` |
| Separator | `separator.tsx` |
| Sheet | `sheet.tsx` |
| Sidebar | `sidebar.tsx` |
| Skeleton | `skeleton.tsx` |
| Slider | `slider.tsx` |
| Sonner (Toast) | `sonner.tsx` |
| Spinner | `spinner.tsx` |
| Switch | `switch.tsx` |
| Table | `table.tsx` |
| Tabs | `tabs.tsx` |
| Textarea | `textarea.tsx` |
| Toggle | *(via Radix)* |
| Toggle Group | *(via Radix)* |
| Tooltip | *(via Radix)* |

</details>

### Radix UI Primitives (17 packages)

All prefixed `@radix-ui/react-*`:

| Primitive | Version |
|---|---|
| Accordion | `^1.2.12` |
| Alert Dialog | `^1.1.15` |
| Aspect Ratio | `^1.1.8` |
| Avatar | `^1.1.11` |
| Checkbox | `^1.3.3` |
| Collapsible | `^1.1.12` |
| Context Menu | `^2.2.16` |
| Dialog | `^1.1.15` |
| Dropdown Menu | `^2.1.16` |
| Hover Card | `^1.1.15` |
| Label | `^2.1.8` |
| Menubar | `^1.1.16` |
| Navigation Menu | `^1.2.14` |
| Popover | `^1.1.15` |
| Progress | `^1.1.8` |
| Radio Group | `^1.3.8` |
| Scroll Area | `^1.2.10` |
| Select | `^2.2.6` |
| Separator | `^1.1.8` |
| Slider | `^1.3.6` |
| Slot | `^1.2.4` |
| Switch | `^1.2.6` |
| Tabs | `^1.1.13` |
| Toggle | `^1.1.10` |
| Toggle Group | `^1.1.11` |
| Tooltip | `^1.2.8` |

---

## 🔌 Key Libraries & Dependencies

### Routing
| Library | Version | Purpose |
|---|---|---|
| **react-router-dom** | `^7.13.0` | Client-side routing with `BrowserRouter`, `Routes`, `Route`, `Navigate` |

### HTTP Client & API
| Library | Version | Purpose |
|---|---|---|
| **Axios** | `^1.13.5` | HTTP client for REST API communication |

### Forms & Validation
| Library | Version | Purpose |
|---|---|---|
| **react-hook-form** | `^7.70.0` | Performant form state management |
| **@hookform/resolvers** | `^5.2.2` | Validation resolver integration |
| **Zod** | `^4.3.5` | Schema-based validation |

### Data Display & Visualization
| Library | Version | Purpose |
|---|---|---|
| **@tanstack/react-table** | `^8.21.3` | Headless table/data-grid framework |
| **Recharts** | `^2.15.4` | Charting library (built on D3) |

### Animations
| Library | Version | Purpose |
|---|---|---|
| **Framer Motion** | `^12.34.1` | Declarative animations and gestures |

### Utility Libraries
| Library | Version | Purpose |
|---|---|---|
| **class-variance-authority** | `^0.7.1` | Variant-based component styling |
| **clsx** | `^2.1.1` | Conditional class name composition |
| **tailwind-merge** | `^3.4.0` | Intelligent Tailwind class merging |
| **date-fns** | `^4.1.0` | Date utility functions |
| **cmdk** | `^1.1.1` | Command menu component |

### UI Enhancements
| Library | Version | Purpose |
|---|---|---|
| **Sonner** | `^2.0.7` | Toast notification system |
| **Vaul** | `^1.1.2` | Drawer component |
| **input-otp** | `^1.4.2` | One-time password input |
| **react-day-picker** | `^9.13.0` | Date picker component |
| **embla-carousel-react** | `^8.6.0` | Carousel/slider component |
| **react-resizable-panels** | `^4.2.2` | Resizable panel layouts |
| **lucide-react** | `^0.562.0` | Icon library (500+ icons) |

### Theming
| Library | Version | Purpose |
|---|---|---|
| **next-themes** | `^0.4.6` | Theme management (light/dark mode) |

---

## 🧪 Developer Tooling

| Tool | Version | Purpose |
|---|---|---|
| **ESLint** | `^9.39.1` | JavaScript/TypeScript linter |
| **typescript-eslint** | `^8.46.4` | TypeScript-specific ESLint rules |
| **eslint-plugin-react-hooks** | `^7.0.1` | React hooks lint rules |
| **eslint-plugin-react-refresh** | `^0.4.24` | Fast Refresh safety rules |
| **kimi-plugin-inspect-react** | `^1.0.3` | React component inspection dev plugin |

---

## 📁 Project Structure

```
src/
├── api/                    # API service layer (Axios-based)
│   ├── axios.ts            # Axios instance & interceptors
│   ├── auth.ts             # Authentication API calls
│   ├── courses.ts          # Course management API
│   ├── departments.ts      # Department API
│   ├── faculty.ts          # Faculty API
│   ├── statistics.ts       # Dashboard statistics API
│   ├── student.ts          # Student profile API
│   ├── students.ts         # Student management API
│   ├── teachers.ts         # Teacher management API
│   └── timetable.ts        # Timetable API
│
├── components/
│   ├── ui/                 # shadcn/ui components (53 files)
│   ├── common/             # Shared reusable components (9 files)
│   ├── student/            # Student-specific components (6 files)
│   ├── faculty/            # Faculty-specific components (3 files)
│   ├── ErrorBoundary.tsx   # React error boundary
│   ├── Navbar.tsx          # Navigation bar
│   ├── ProtectedRoute.tsx  # Role-based route guard
│   └── ThemeSwitcher.tsx   # Light/dark mode toggle
│
├── context/
│   ├── AuthContext.tsx      # Authentication state (JWT, roles)
│   └── ThemeContext.tsx     # Theme state management
│
├── hooks/                  # Custom React hooks
│   ├── use-mobile.ts       # Responsive breakpoint hook
│   ├── useCourses.ts       # Course data hook
│   ├── useDepartments.ts   # Department data hook
│   ├── useStatistics.ts    # Statistics data hook
│   ├── useStudents.ts      # Student data hook
│   ├── useTeachers.ts      # Teacher data hook
│   └── useTimetable.ts     # Timetable data hook
│
├── pages/                  # Route-level page components
│   ├── Login.tsx           # Login page
│   ├── AdminDashboard.tsx  # Admin dashboard
│   ├── StudentDashboard.tsx# Student dashboard
│   ├── FacultyDashboard.tsx# Faculty dashboard
│   ├── NotFound.tsx        # 404 page
│   └── Unauthorized.tsx    # 403 page
│
├── sections/               # Admin dashboard sections
│   ├── ManageCourses.tsx
│   ├── ManageDepartments.tsx
│   ├── ManageStudents.tsx
│   ├── ManageTeachers.tsx
│   ├── StudentStatusManagement.tsx
│   └── TimetableManagement.tsx
│
├── types/                  # TypeScript type definitions
│   └── index.ts
│
├── utils/                  # Utility functions
│   └── validation.ts       # Zod validation schemas
│
├── lib/
│   └── utils.ts            # Tailwind merge utility (cn())
│
├── App.tsx                 # Root component (providers, router)
├── main.tsx                # Entry point (React DOM render)
├── routes.tsx              # Route definitions
├── App.css                 # Global app styles
└── index.css               # Tailwind directives & CSS variables
```

---

## 🔐 Architecture Patterns

### Authentication & Authorization
- **JWT-based auth** managed via `AuthContext`
- **Role-based access control** with `ProtectedRoute` component
- Three roles: `admin`, `student`, `teacher`/`faculty`

### State Management
- **React Context API** for global state (Auth, Theme)
- **Custom hooks** for data fetching and API state management
- No external state library (Redux, Zustand, etc.)

### API Layer
- Centralized **Axios instance** with interceptors (`src/api/axios.ts`)
- Modular API service files per domain entity
- Custom hooks abstract API calls for components

### Component Architecture
- **Atomic design** with shadcn/ui primitives as base layer
- Domain-specific components (`student/`, `faculty/`, `common/`)
- Section-based admin dashboard with dedicated management views

### Error Handling
- **ErrorBoundary** component wrapping the entire app
- Global `window.onerror` handler in `main.tsx`
- Toast notifications via **Sonner** for user-facing feedback

### Theming
- **Dark/Light mode** via `next-themes` + CSS variables
- Class-based dark mode toggle (`darkMode: ["class"]`)
- HSL-based design tokens for consistent theming

---

## 📦 Build & Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start development server with HMR |
| `build` | `tsc -b && vite build` | Type-check then production build |
| `lint` | `eslint .` | Run ESLint on all files |
| `preview` | `vite preview` | Preview production build locally |

---

## 🗂️ Configuration Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite build config, path aliases, plugins |
| `tsconfig.json` | Root TypeScript config with project references |
| `tsconfig.app.json` | App-specific TS config (ES2022, strict, JSX) |
| `tsconfig.node.json` | Node-specific TS config (for Vite config files) |
| `tailwind.config.js` | Tailwind theme, colors, animations, plugins |
| `postcss.config.js` | PostCSS plugins (Tailwind, Autoprefixer) |
| `eslint.config.js` | Flat ESLint config with TS + React rules |
| `components.json` | shadcn/ui configuration (style, aliases) |
