/**
 * Central API service — all backend calls go through here.
 * Base URL is read from VITE_API_URL env var (default: http://localhost:5000/api).
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// ─── helpers ────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
export interface ApiGoal {
  _id: string;
  employeeId: string;
  title: string;
  progress: number;
  dueDate?: string;
  createdAt: string;
}

export interface ApiTask {
  _id: string;
  employeeId: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

export interface ApiPerformanceReview {
  _id: string;
  employeeId: { _id: string; name: string; department: string; role: string };
  score: number;
  reviewPeriod: string;
  managerFeedback?: string;
  createdAt: string;
}

export const performanceService = {
  // Goals
  getGoals: (employeeId?: string) =>
    request<{ success: boolean; goals: ApiGoal[] }>('GET', employeeId ? `/performance/goals?employeeId=${employeeId}` : '/performance/goals'),
  createGoal: (title: string, dueDate?: string, employeeId?: string) =>
    request<{ success: boolean; goal: ApiGoal; message: string }>('POST', '/performance/goals', { title, dueDate, employeeId }),
  updateGoalProgress: (id: string, progress: number) =>
    request<{ success: boolean; goal: ApiGoal; message: string }>('PUT', `/performance/goals/${id}`, { progress }),
  deleteGoal: (id: string) =>
    request<{ success: boolean; message: string }>('DELETE', `/performance/goals/${id}`),

  // Tasks
  getTasks: (employeeId?: string) =>
    request<{ success: boolean; tasks: ApiTask[] }>('GET', employeeId ? `/performance/tasks?employeeId=${employeeId}` : '/performance/tasks'),
  createTask: (title: string, priority: string, employeeId?: string) =>
    request<{ success: boolean; task: ApiTask; message: string }>('POST', '/performance/tasks', { title, priority, employeeId }),
  updateTaskStatus: (id: string, status: string) =>
    request<{ success: boolean; task: ApiTask; message: string }>('PUT', `/performance/tasks/${id}`, { status }),
  deleteTask: (id: string) =>
    request<{ success: boolean; message: string }>('DELETE', `/performance/tasks/${id}`),

  // Reviews
  getReviews: (employeeId?: string) =>
    request<{ success: boolean; reviews: ApiPerformanceReview[] }>('GET', employeeId ? `/performance/reviews?employeeId=${employeeId}` : '/performance/reviews'),
  createReview: (employeeId: string, score: number, reviewPeriod: string, managerFeedback: string) =>
    request<{ success: boolean; review: ApiPerformanceReview; message: string }>('POST', '/performance/reviews', { employeeId, score, reviewPeriod, managerFeedback }),
};

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  const data: T = await res.json();
  if (!res.ok) {
    const msg = (data as { message?: string })?.message ?? 'Request failed';
    throw new Error(msg);
  }
  return data;
}

// ─── types ───────────────────────────────────────────────────────────────────

export interface ApiEmployee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: string;
  basicPay: number;
}

export interface AddEmployeePayload {
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  joinDate: string;
  basicPay: number;
}

export interface EmployeeListResponse {
  success: boolean;
  employees: ApiEmployee[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PayrollRecord {
  _id: string;
  employeeId: { _id: string; name: string; employeeId: string; department: string };
  month: string;
  year: number;
  basicPay: number;
  deductions: number;
  netPay: number;
  status: 'Pending' | 'Processing' | 'Paid';
  processedAt?: string;
}

export interface PayrollSummary {
  totalAmount: number;
  paidCount: number;
  processingCount: number;
  pendingCount: number;
}

export interface HrSummary {
  totalEmployees: number;
  attendanceRate: string;
  payrollStatus: string;
  pendingApprovals: number;
}

export interface Activity {
  action: string;
  name: string;
  dept: string;
  time: string;
}

export interface EmployeeSummary {
  employee: {
    name: string;
    role: string;
    department: string;
  };
  workspace: {
    attendanceStatus: string;
    checkInTime: string | null;
    attendanceRate?: number;
  };
  payrollLeave: {
    leavesTaken: number;
    leaveBalance: number;
    latestNetPay: number;
    payrollStatus?: string;
  };
  performance?: {
    score: number;
    skills: Array<{ name: string; proficiency: number; endorsements: number }>;
  };
  productivity?: {
    pendingTasksCount: number;
    goals: Array<{ title: string; progress: number }>;
  };
}

export interface ApiAttendance {
  _id: string;
  employeeId: { _id: string; name: string; employeeId: string; department: string };
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
}

export interface ApiLeave {
  _id: string;
  employeeId: { _id: string; name: string; department: string };
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
}

export interface ApiDocument {
  _id: string;
  employeeId?: string;
  title: string;
  type: string;
  fileUrl: string;
  createdAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authService = {
  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; user: Record<string, unknown> }>(
      'POST',
      '/auth/login',
      { email, password },
    ),

  register: (name: string, email: string, password: string, role = 'employee') =>
    request<{ success: boolean; token: string; user: Record<string, unknown> }>(
      'POST',
      '/auth/register',
      { name, email, password, role },
    ),
};

// ─── Employees ───────────────────────────────────────────────────────────────

export const employeeService = {
  getAll: (params?: { search?: string; department?: string; status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.department && params.department !== 'All') qs.set('department', params.department);
    if (params?.status && params.status !== 'All') qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<EmployeeListResponse>('GET', `/employees?${qs.toString()}`);
  },

  getById: (id: string) =>
    request<{ success: boolean; employee: ApiEmployee }>('GET', `/employees/${id}`),

  add: (payload: AddEmployeePayload) =>
    request<{ success: boolean; employee: ApiEmployee }>('POST', '/employees', payload),

  update: (id: string, payload: Partial<AddEmployeePayload>) =>
    request<{ success: boolean; employee: ApiEmployee }>('PUT', `/employees/${id}`, payload),

  deactivate: (id: string) =>
    request<{ success: boolean; message: string }>('DELETE', `/employees/${id}`),

  bulkDeactivate: (employeeIds: string[]) =>
    request<{ success: boolean; message: string }>('POST', '/employees/bulk-deactivate', { employeeIds }),

  bulkChangeDepartment: (employeeIds: string[], department: string) =>
    request<{ success: boolean; message: string }>('POST', '/employees/bulk-department', { employeeIds, department }),
};

// ─── Payroll ─────────────────────────────────────────────────────────────────

export const payrollService = {
  getRecords: (params?: { month?: string; year?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.month) qs.set('month', params.month);
    if (params?.year) qs.set('year', String(params.year));
    if (params?.status) qs.set('status', params.status);
    return request<{ success: boolean; records: PayrollRecord[] }>('GET', `/payroll?${qs.toString()}`);
  },

  getSummary: (month?: string, year?: number) => {
    const qs = new URLSearchParams();
    if (month) qs.set('month', month);
    if (year) qs.set('year', String(year));
    return request<{ success: boolean; summary: PayrollSummary }>('GET', `/payroll/summary?${qs.toString()}`);
  },

  run: (month: string, year: number) =>
    request<{ success: boolean; message: string; recordsGenerated: number }>(
      'POST', '/payroll/run', { month, year },
    ),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardService = {
  getHrSummary: () =>
    request<{ success: boolean; summary: HrSummary }>('GET', '/dashboard/hr-summary'),

  getRecentActivity: () =>
    request<{ success: boolean; activities: Activity[] }>('GET', '/dashboard/recent-activity'),

  getEmployeeSummary: () =>
    request<{ success: boolean; summary: EmployeeSummary }>('GET', '/dashboard/employee-summary'),
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportsService = {
  getHeadcountTrend: () =>
    request<{ success: boolean; trend: [string, number][] }>('GET', '/reports/headcount'),

  getPayrollTrend: () =>
    request<{ success: boolean; trend: [string, number][] }>('GET', '/reports/payroll-trend'),

  getLeaveBreakdown: () =>
    request<{ success: boolean; breakdown: [string, number, string][] }>('GET', '/reports/leave-breakdown'),

  getDeptAttendance: () =>
    request<{ success: boolean; attendance: [string, number][] }>('GET', '/reports/dept-attendance'),

  generateMonthlyReport: (month: string, year: number) =>
    request<{ success: boolean; message: string; downloadUrl: string }>('GET', `/reports/monthly-report?month=${month}&year=${year}`),
};

// ─── Attendance ──────────────────────────────────────────────────────────────

export const attendanceService = {
  getAll: () => request<{ success: boolean; records: ApiAttendance[] }>('GET', '/attendance'),
  checkIn: () => request<{ success: boolean; message: string; record: ApiAttendance }>('POST', '/attendance/check-in'),
  checkOut: () => request<{ success: boolean; message: string; record: ApiAttendance }>('POST', '/attendance/check-out'),
  regularize: (payload: { date: string; reason: string; checkIn?: string; checkOut?: string }) => 
    request<{ success: boolean; message: string; record: ApiAttendance }>('POST', '/attendance/regularize', payload),
  updateStatus: (id: string, status: string) => 
    request<{ success: boolean; message: string; record: ApiAttendance }>('PUT', `/attendance/${id}/status`, { status }),
};

// ─── Leave ───────────────────────────────────────────────────────────────────

export const leaveService = {
  getAll: () => request<{ success: boolean; leaves: ApiLeave[] }>('GET', '/leave'),
  apply: (payload: { employeeId: string; type: string; fromDate: string; toDate: string; days: number; reason?: string }) =>
    request<{ success: boolean; message: string; leave: ApiLeave }>('POST', '/leave', payload),
  updateStatus: (id: string, status: "Approved" | "Rejected" | "Pending") =>
    request<{ success: boolean; leave: ApiLeave }>('PUT', `/leave/${id}/status`, { status }),
};

// ─── AI Assistant ────────────────────────────────────────────────────────────

export const aiService = {
  ask: (prompt: string) => request<{ success: boolean; response: string }>('POST', '/ai/ask', { prompt }),
};

// ─── Analytics ───────────────────────────────────────────────────────────────

export const analyticsService = {
  getAttendanceHeatmap: () => request<{ success: boolean; heatmap: any[] }>('GET', '/analytics/attendance-heatmap'),
  getAttritionRisk: () => request<{ success: boolean; attritionRisk: any[] }>('GET', '/analytics/attrition-risk'),
  getLeaveApprovalTrend: () => request<{ success: boolean; trend: any[] }>('GET', '/analytics/leave-approval-trend'),
  getPayrollDistribution: () => request<{ success: boolean; salaryDistribution: any[]; departmentPayrollCost: any[]; compensationBreakdown: any[] }>('GET', '/analytics/payroll-distribution'),
};

// ─── Documents ───────────────────────────────────────────────────────────────

export const documentService = {
  getAll: (employeeId?: string) => request<{ success: boolean; documents: ApiDocument[] }>('GET', employeeId ? `/documents?employeeId=${employeeId}` : '/documents'),
  upload: async (formData: FormData) => {
    // FormData requires different fetch logic because of multipart/form-data
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE}/documents/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },
  delete: (id: string) => request<{ success: boolean; message: string }>('DELETE', `/documents/${id}`),
};


// ─── Company Hub: Events & Skills ─────────────────────────────────────────────

export interface ApiEvent {
  _id: string;
  title: string;
  date: string;
  type: 'Holiday' | 'Birthday' | 'Anniversary' | 'Training';
  createdAt: string;
}

export interface ApiSkill {
  _id: string;
  employeeId: { _id: string; name: string; department: string; role: string };
  name: string;
  proficiency: number;
  endorsements: number;
  createdAt: string;
}

export const companyService = {
  // Events
  getEvents: () => request<{ success: boolean; events: ApiEvent[] }>('GET', '/company/events'),
  createEvent: (title: string, date: string, type: string) =>
    request<{ success: boolean; event: ApiEvent; message: string }>('POST', '/company/events', { title, date, type }),
  deleteEvent: (id: string) => request<{ success: boolean; message: string }>('DELETE', `/company/events/${id}`),

  // Skills
  getSkills: (department?: string) =>
    request<{ success: boolean; skills: ApiSkill[] }>('GET', department ? `/company/skills?department=${department}` : '/company/skills'),
  createSkill: (name: string, proficiency: number, employeeId?: string) =>
    request<{ success: boolean; skill: ApiSkill; message: string }>('POST', '/company/skills', { name, proficiency, employeeId }),
  endorseSkill: (id: string) =>
    request<{ success: boolean; skill: ApiSkill; message: string }>('POST', `/company/skills/${id}/endorse`),
  deleteSkill: (id: string) => request<{ success: boolean; message: string }>('DELETE', `/company/skills/${id}`),
};