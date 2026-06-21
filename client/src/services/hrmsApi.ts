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
  };
  payrollLeave: {
    leavesTaken: number;
    leaveBalance: number;
    latestNetPay: number;
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
};

// ─── Attendance ──────────────────────────────────────────────────────────────

export const attendanceService = {
  getAll: () => request<{ success: boolean; records: ApiAttendance[] }>('GET', '/attendance'),
  checkIn: () => request<{ success: boolean; message: string; record: ApiAttendance }>('POST', '/attendance/check-in'),
  checkOut: () => request<{ success: boolean; message: string; record: ApiAttendance }>('POST', '/attendance/check-out'),
};

// ─── Leave ───────────────────────────────────────────────────────────────────

export const leaveService = {
  getAll: () => request<{ success: boolean; leaves: ApiLeave[] }>('GET', '/leave'),
  apply: (payload: { employeeId: string; type: string; fromDate: string; toDate: string; days: number; reason?: string }) =>
    request<{ success: boolean; message: string; leave: ApiLeave }>('POST', '/leave', payload),
  updateStatus: (id: string, status: 'Approved' | 'Rejected') =>
    request<{ success: boolean; leave: ApiLeave }>('PUT', `/leave/${id}/status`, { status }),
};

// ─── AI Assistant ────────────────────────────────────────────────────────────

export const aiService = {
  ask: (prompt: string) => request<{ success: boolean; response: string }>('POST', '/ai/ask', { prompt }),
};
