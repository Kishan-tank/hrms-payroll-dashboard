# 🏢 HRMS & Payroll Automation Dashboard

> An enterprise-grade Human Resource Management System (HRMS) & Payroll Automation Platform built with **React 18, TypeScript, Vite, Node.js, Express, and MongoDB**. Features guided employee onboarding verification, encrypted bank details, automated salary slip generation, attendance tracking, leave approval workflows, and role-based access control (RBAC).

---

## 🌟 Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Role Guards**: Secure views tailored for **Admin**, **HR Manager**, and **Employee** roles.
- **JWT Authentication**: Token-based sessions with automatic logout on token expiration.
- **Account Lifecycle Safety**: Soft-delete pattern (`isActive: false`) preventing accidental data loss while allowing user email reuse after deletion.

### 📋 2. Guided Employee Onboarding & Verification
- **Multi-Step Onboarding Wizard**: Guided 5-step employee self-onboarding (Personal Info, Upload Documents, Bank Details, Employee Handbook Policy, Completion).
- **Dedicated Onboarding Reviews Queue**: Admin & HR review portal to inspect, verify, download uploaded government IDs/certificates, and approve/reject profile activations.
- **Data Encryption**: Sensitive bank account numbers encrypted at rest in MongoDB using AES-256-CBC encryption.

### 💳 3. Payroll Processing & Salary Management
- **Automated Monthly Payroll**: Bulk payroll processing with automatic basic pay calculation, allowances, taxes, and net pay computation.
- **Pending Payroll Queue**: Amber notification section listing active employees who lack a salary structure, allowing single-click "Set Payroll" creation.
- **Compact Edit Payroll Modal**: Ergonomic 2-column modal interface optimized for laptop screens (1366x768).

### ⏰ 4. Attendance & Leave Management
- **Daily Attendance Tracking**: Real-time check-in/out timestamp logging with status indicators (Present, Late, Absent).
- **Leave Request Workflow**: Employee leave application submission with HR approval/rejection actions and leave balance tracking.

### 👤 5. Employee Directory & Global Employee Drawer
- **Global Employee Drawer**: Slide-over panel accessible from any page with multi-tab views: *Overview, Attendance, Leave, Payroll, Documents, and Activity Feed*.
- **Robust Matching Algorithm**: Intelligent lookup handling populated references, string IDs, employee codes, and email fallbacks seamlessly.

### 📊 6. Analytics & Visualizations
- **Interactive Dashboards**: Department salary distribution, workforce trends, and payroll cost breakdowns powered by Recharts.
- **Responsive Dark/Light Mode**: Sleek glassmorphic theme with Tailwind CSS and Framer Motion micro-animations.

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Core Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Glassmorphism design system
- **Icons**: Lucide React Icons
- **Animations**: Framer Motion
- **Data Visualization**: Recharts

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Security**: AES-256-CBC encryption, bcrypt password hashing, JWT
- **File Uploads**: Multer
- **Email Notifications**: Nodemailer

---

## 📁 Project Structure

```text
hrms-payroll-dashboard/
├── client/                      # React Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── employees/       # Employee Drawer & Modals
│   │   │   ├── onboarding/      # Onboarding Wizard & Review Components
│   │   │   └── common/          # Tables, Badges, Command Palette
│   │   ├── context/             # Global Drawer & App Contexts
│   │   ├── hooks/               # Custom React Hooks
│   │   ├── layouts/             # Dashboard Layout & Navigation
│   │   ├── pages/               # Page Views (Employee, Payroll, Onboarding, etc.)
│   │   ├── routes/              # Protected & Role-Guarded App Routes
│   │   └── services/            # API Service Layer (hrmsApi.ts)
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # Express Backend API Server
│   ├── src/
│   │   ├── config/              # Database Connection (db.js)
│   │   ├── controllers/         # Business Logic (onboarding, payroll, user, etc.)
│   │   ├── middleware/          # Auth & Role RBAC Middlewares
│   │   ├── models/              # Mongoose Schemas (User, Employee, Onboarding, Payroll)
│   │   ├── routes/              # REST Express Routes
│   │   ├── utils/               # Encryption & Helper Functions
│   │   └── server.js            # Main Express Server Entrypoint
│   ├── uploads/                 # Uploaded Employee Onboarding Documents
│   ├── .env                     # Server Environment Configuration
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas Connection URI

---

### 📥 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/krishnachikhliya080/hrms-payroll-dashboard.git
   cd hrms-payroll-dashboard
   ```

2. **Backend Setup (`/server`)**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file inside `/server`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hrms
   JWT_SECRET=your_super_secret_jwt_key_123
   ENCRYPTION_KEY=32_byte_hex_string_for_aes_256_cbc
   ADMIN_EMAIL=admin@hrms.com
   ```

3. **Frontend Setup (`/client`)**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file inside `/client`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

### 🏃 Running Locally

1. **Start the Backend Server** (Port 5000)
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend Application** (Port 5173)
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

---

## 🔗 Key API Endpoints Summary

| Module | Method | Endpoint | Description | Access |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & get JWT token | Public |
| **Auth** | `POST` | `/api/users/initiate` | Send account creation link | Admin / HR |
| **Onboarding** | `GET` | `/api/onboarding/pending-reviews` | Get list of onboardings awaiting HR review | Admin / HR |
| **Onboarding** | `PATCH` | `/api/onboarding/:id/review-status` | Approve or reject employee onboarding | Admin / HR |
| **Onboarding** | `POST` | `/api/onboarding/profile` | Submit personal profile details | Employee |
| **Onboarding** | `POST` | `/api/onboarding/bank` | Submit & encrypt bank details | Employee |
| **Onboarding** | `POST` | `/api/onboarding/documents` | Upload required onboarding documents | Employee |
| **Payroll** | `GET` | `/api/payroll/unassigned` | Get active employees without set payroll | Admin / HR |
| **Payroll** | `POST` | `/api/payroll/single` | Assign salary structure to an employee | Admin / HR |
| **Payroll** | `POST` | `/api/payroll/run` | Process bulk monthly payroll | Admin / HR |
| **Employees** | `GET` | `/api/employees` | List all active employee records | All Roles |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License.
