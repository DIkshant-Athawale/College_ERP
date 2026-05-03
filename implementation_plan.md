# Deploy College ERP Project

## Project Overview

| Component | Technology | Current Setup |
|-----------|-----------|---------------|
| **Frontend** | React 19 + Vite 7 + TailwindCSS | Dev server at `localhost:5173`, proxies API to `:3000` |
| **Backend** | Express 5 + Node.js (ESM) | Runs on `localhost:3000` |
| **Database** | MySQL (`clg_db`) | Local MySQL, user `root`, no password |
| **Real-Time** | Socket.IO 4.8 | WebSocket via same backend server |

## Deployment Strategy

> [!IMPORTANT]
> Your app has 3 tiers (frontend, backend, MySQL database), so we need a platform for each. Below are **free-tier** options that work well together.

### Recommended Platform Stack

| Component | Platform | Why |
|-----------|----------|-----|
| **Frontend** | **Vercel** (free) | Zero-config Vite/React deploys, global CDN, custom domains |
| **Backend** | **Render** (free) | Supports Node.js web services, WebSockets, env vars |
| **Database** | **Aiven** or **TiDB Serverless** (free MySQL) | Free managed MySQL with generous limits |

### Alternative Options

| Component | Alternatives |
|-----------|-------------|
| Frontend | Netlify, Cloudflare Pages |
| Backend | Railway (free trial), Fly.io |
| Database | PlanetScale (MySQL-compatible), Railway MySQL |

## User Review Required

> [!IMPORTANT]
> **Which platform do you want to use?** The plan below assumes **Vercel + Render + Aiven** (all free). If you prefer a different combination, let me know and I'll adjust.

> [!WARNING]
> **Render free tier limitation**: Free web services spin down after 15 minutes of inactivity. The first request after spin-down takes ~30-60 seconds. This is fine for a college project demo.

## Open Questions

1. **Do you have accounts on Vercel, Render, and a MySQL cloud provider?** If not, I'll guide you through signup.
2. **Is this project in a GitHub repository?** Both Vercel and Render can auto-deploy from GitHub. If not, we'll need to push it first.
3. **Do you want a custom domain?** Or are the default platform subdomains (e.g., `college-erp.vercel.app`) fine?
4. **Database seeding**: Do you have a `db.sql` file with schema + sample data? (I see `setup_db.bat` references one, but I didn't find `db.sql` in the `db/` folder.)

## Proposed Changes

### 1. Database (Aiven / TiDB)

#### Setup (manual — no code changes)
- Sign up at [aiven.io](https://aiven.io) or [tidbcloud.com](https://tidbcloud.com)
- Create a free MySQL service
- Note the connection details: `host`, `port`, `user`, `password`, `database`
- Import your `db.sql` schema using MySQL Workbench or CLI:
  ```bash
  mysql -h <host> -P <port> -u <user> -p <database> < db.sql
  ```

---

### 2. Backend (Render)

#### [MODIFY] [connect_db.js](file:///c:/Users/diksh/OneDrive/Desktop/final_year_project/backend/config/connect_db.js)
Switch from hardcoded localhost credentials to environment variables:

```diff
 import mysql from "mysql2/promise";

 const pool = mysql.createPool({
-  host: "localhost",
-  user: "root",
-  password: "",
-  database: "clg_db",
+  host: process.env.DB_HOST || "localhost",
+  user: process.env.DB_USER || "root",
+  password: process.env.DB_PASSWORD || "",
+  database: process.env.DB_NAME || "clg_db",
+  port: parseInt(process.env.DB_PORT || "3306"),
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
+  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
 });
```

#### [MODIFY] [index.js](file:///c:/Users/diksh/OneDrive/Desktop/final_year_project/backend/index.js)
Update CORS to allow the deployed frontend origin:

```diff
     app.use(cors({
-        origin: true,
+        origin: process.env.FRONTEND_URL || true,
         credentials: true
     }));
```

Also update Socket.IO CORS:
```diff
     const io = new Server(server, {
         cors: {
-            origin: true,
+            origin: process.env.FRONTEND_URL || true,
             credentials: true,
             methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
         }
     });
```

#### [MODIFY] [package.json](file:///c:/Users/diksh/OneDrive/Desktop/final_year_project/backend/package.json)
Change start script from `nodemon` (dev tool) to `node` for production:

```diff
   "scripts": {
-    "start": "nodemon index.js"
+    "start": "node index.js",
+    "dev": "nodemon index.js"
   },
```

#### Render Setup (manual)
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo, set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add **Environment Variables**:
   | Variable | Value |
   |----------|-------|
   | `DB_HOST` | *(from Aiven)* |
   | `DB_PORT` | *(from Aiven)* |
   | `DB_USER` | *(from Aiven)* |
   | `DB_PASSWORD` | *(from Aiven)* |
   | `DB_NAME` | `clg_db` |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | *(generate a strong secret)* |
   | `REFRESH_SECRET` | *(generate a strong secret)* |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |
   | `PORT` | `3000` |

---

### 3. Frontend (Vercel)

#### [MODIFY] [.env](file:///c:/Users/diksh/OneDrive/Desktop/final_year_project/frontend/app/.env) (for production)
Will be set in Vercel dashboard, not in the file:
```
VITE_API_URL=https://your-backend.onrender.com
```

#### [MODIFY] [SocketContext.tsx](file:///c:/Users/diksh/OneDrive/Desktop/final_year_project/frontend/app/src/context/SocketContext.tsx)
Ensure Socket.IO connects to the correct production backend URL (likely already handled via `VITE_API_URL`).

#### Vercel Setup (manual)
1. Go to [vercel.com](https://vercel.com) → Import Project
2. Connect your GitHub repo
3. Set **Root Directory** to `frontend/app`
4. Set **Build Command**: `npm run build` (auto-detected)
5. Set **Output Directory**: `dist` (auto-detected)
6. Add **Environment Variable**:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com` |

---

## Verification Plan

### Automated Tests
- After deploying backend, hit `GET /` endpoint to verify `"Server is ready"` response
- Verify frontend loads at Vercel URL

### Manual Verification
- Test login flow end-to-end (student/admin/teacher)
- Verify real-time Socket.IO updates work across the deployed stack
- Test all CRUD operations through the UI
- Verify token refresh works with the deployed backend
