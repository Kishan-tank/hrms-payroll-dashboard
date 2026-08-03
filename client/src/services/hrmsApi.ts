/**
 * Central API service — all backend calls go through here.
 * Base URL is read from VITE_API_URL env var (default: http://localhost:5000/api).
 */

const BASE = import.meta.env.VITE_API_URL ?? '/api';

// ─── helpers ────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string,
  body?: unknown,
  customOptions?: RequestInit
): Promise<T> {
  const isFormData = body instanceof FormData;
  const headers = new Headers(customOptions?.headers || {});

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const auth = authHeaders();
  if (auth.Authorization) {
    headers.set('Authorization', auth.Authorization);
  }

  const options: RequestInit = {
    ...customOptions,
    method,
    headers,
    body: body !== undefined ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
  };

  if (method === 'GET') {
    options.cache = 'no-store';
  }

  const res = await fetch(`${BASE}${path}`, options);

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  const contentType = res.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      throw new Error('Invalid JSON response from server');
    }
  } else {
    if (!res.ok) {
      throw new Error(`Server endpoint not found or error (${res.status})`);
    }
    data = await res.text();
  }

  if (!res.ok) {
    const msg = (data as { message?: string })?.message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}
export interface ApiGoal {
  _id: string;
  employeeId: string | { _id: string; name: string; department: string; role?: string; email?: string };
  title: string;
  description?: string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Missed';
  dueDate?: string;
  createdAt: string;
}

export interface ApiTask {
  _id: string;
  employeeId: string | { _id: string; name: string; department: string; role?: string };
  title: string;
  status: 'Pending' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

export interface ApiPerformanceReview {
  _id: string;
  employeeId: { _id: string; name: string; department: string; role: string; email?: string };
  reviewerId?: { _id: string; name: string; department: string; role?: string };
  score: number;
  reviewPeriod: string;
  managerFeedback?: string;
  status: 'Draft' | 'Submitted' | 'Acknowledged';
  createdAt: string;
}

export const performanceService = {
  // Goals
  getGoals: (employeeId?: string) =>
    request<{ success: boolean; goals: ApiGoal[] }>('GET', employeeId ? `/performance/goals?employeeId=${employeeId}` : '/performance/goals'),
  createGoal: (payload: { title: string; description?: string; dueDate?: string; progress?: number; status?: string; employeeId?: string }) =>
    request<{ success: boolean; goal: ApiGoal; message: string }>('POST', '/performance/goals', payload),
  updateGoalProgress: (id: string, progress: number) =>
    request<{ success: boolean; goal: ApiGoal; message: string }>('PATCH', `/performance/goals/${id}/progress`, { progress }),
  updateGoal: (id: string, payload: { title?: string; description?: string; dueDate?: string; progress?: number; status?: string }) =>
    request<{ success: boolean; goal: ApiGoal; message: string }>('PUT', `/performance/goals/${id}`, payload),
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
  createReview: (employeeId: string, score: number, reviewPeriod: string, managerFeedback: string, status?: string) =>
    request<{ success: boolean; review: ApiPerformanceReview; message: string }>('POST', '/performance/reviews', { employeeId, score, reviewPeriod, managerFeedback, status }),
  updateReview: (id: string, payload: { score?: number; reviewPeriod?: string; managerFeedback?: string; status?: string }) =>
    request<{ success: boolean; review: ApiPerformanceReview; message: string }>('PUT', `/performance/reviews/${id}`, payload),
  deleteReview: (id: string) =>
    request<{ success: boolean; message: string }>('DELETE', `/performance/reviews/${id}`),
};


// ─── types ───────────────────────────────────────────────────────────────────

export interface ApiEmployee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Inactive' | string;
  joinDate: string;
  basicPay: number;
  documents?: Array<{ name?: string; type?: string; url?: string }>;
  userId?: string | { _id: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
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

export interface UnassignedEmployee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  basicPay?: number;
  joinDate?: string;
}

export interface HrSummary {
  totalEmployees: number;
  attendanceRate: string;
  payrollStatus: string;
  payrollTotal?: number;
  pendingApprovals: number;
  presentToday?: number;
  onLeave?: number;
  remoteCount?: number;
  workforceHealth?: number;
  approvalQueue?: Array<{ id: string; type: string; user: string; detail: string; time: string; color: string; bg: string }>;
  departments?: Array<{ name: string; count: number; color: string }>;
  spotlight?: { name: string; title: string; department: string; avatar: string; score: number; quote: string; manager: string };
  insights?: Array<{ id: string; category: 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'APPROVALS'; title: string; body: string; confidence: number; accent: string; accentDim: string; action: string }>;
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
  employeeId: { _id: string; name: string; employeeId: string; department: string; email?: string; userId?: string };
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
  // 'Cancelled' added to match backend Leave model (Phase 1 soft-delete change)
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
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
export interface ApiSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  notifications: {
    newLeaveRequests: boolean;
    payrollProcessed: boolean;
    attendanceAlerts: boolean;
    newEmployeeJoined: boolean;
    performanceReviewsDue: boolean;
    systemMaintenance: boolean;
  };
}

export const settingsService = {
  getSettings: () =>
    request<{ success: boolean; settings: ApiSettings }>('GET', '/settings'),

  updateSettings: (settings: ApiSettings) =>
    request<{ success: boolean; settings: ApiSettings; message: string }>('PUT', '/settings', settings),

  updateProfile: (name: string) =>
    request<{ success: boolean; user: any; message: string }>('PUT', '/settings/profile', { name }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean; message: string }>('PUT', '/settings/password', { currentPassword, newPassword }),

  uploadPhoto: (formData: FormData) =>
    request<{ success: boolean; avatar: string; user: any; message: string }>('POST', '/settings/photo', formData, {
      headers: {
        'Accept': 'application/json'
      }
    }),
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

  getMe: () => request<{ success: boolean; employee: ApiEmployee }>('GET', `/employees/me`),

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

  // HR/Admin only: void (soft-delete) a Processing/Pending payroll record
  void: (id: string) =>
    request<{ success: boolean; message: string }>('DELETE', `/payroll/${id}`),

  // Admin-only: edit a payroll record
  edit: (id: string, data: { basicPay?: number; deductions?: number; netPay?: number; status?: string }) =>
    request<{ success: boolean; message: string; record: PayrollRecord }>('PATCH', `/payroll/${id}`, data),

  // HR/Admin: get employees who have no payroll record for the given period
  getUnassigned: (month: string, year: number) => {
    const qs = new URLSearchParams({ month, year: String(year) });
    return request<{ success: boolean; employees: UnassignedEmployee[] }>('GET', `/payroll/unassigned?${qs.toString()}`);
  },

  // HR/Admin: create a first-time payroll record for a single employee
  createSingle: (payload: {
    employeeId: string;
    month: string;
    year: number;
    basicPay?: number;
    deductions?: number;
  }) => request<{ success: boolean; message: string; record: PayrollRecord }>('POST', '/payroll/create-single', payload),

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
  // Admin-only: direct correction of status, check-in, or check-out times
  editRecord: (id: string, payload: { status?: string; checkIn?: string; checkOut?: string; reason?: string }) =>
    request<{ success: boolean; message: string; record: ApiAttendance }>('PATCH', `/attendance/${id}`, payload),
  // Admin-only: soft-delete (deactivate) an attendance record
  deactivate: (id: string) =>
    request<{ success: boolean; message: string }>('DELETE', `/attendance/${id}`),
};

// ─── Leave ───────────────────────────────────────────────────────────────────

export const leaveService = {
  getAll: () => request<{ success: boolean; leaves: ApiLeave[] }>('GET', '/leave'),
  apply: (payload: { employeeId?: string; type: string; fromDate: string; toDate: string; days: number; reason?: string }) =>
    request<{ success: boolean; message: string; leave: ApiLeave }>('POST', '/leave', payload),
  updateStatus: (id: string, status: "Approved" | "Rejected" | "Pending") =>
    request<{ success: boolean; leave: ApiLeave }>('PUT', `/leave/${id}/status`, { status }),
  cancel: (id: string) =>
    request<{ success: boolean; message: string }>('DELETE', `/leave/${id}/cancel`),
};

export interface ApiLeavePolicy {
  _id: string;
  name: string;
  leaveType: string;
  daysAllotted: number;
  department?: string;
  applicableRoles?: string[];
  allowCarryForward?: boolean;
  maxCarryForwardDays?: number;
  isActive?: boolean;
  createdAt?: string;
}

export const leavePolicyService = {
  getPolicies: () => request<{ success: boolean; policies: ApiLeavePolicy[] }>('GET', '/leave-policies'),
  createPolicy: (payload: {
    name: string;
    leaveType: string;
    daysAllotted: number;
    department?: string;
    applicableRoles?: string[];
    allowCarryForward?: boolean;
    maxCarryForwardDays?: number;
  }) => request<{ success: boolean; message: string; policy: ApiLeavePolicy }>('POST', '/leave-policies', payload),
};

// ─── AI Assistant ────────────────────────────────────────────────────────────

export interface AIInsight {
  id: string;
  category: 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'APPROVALS';
  title: string;
  body: string;
  confidence: number;
  action: string;
  sentiment: 'positive' | 'warning' | 'critical' | 'neutral';
}

export const aiService = {
  ask: (prompt: string) => request<{ success: boolean; response: string }>('POST', '/ai/ask', { prompt }),
  getInsights: (contextPayload: Record<string, unknown>) =>
    request<{ success: boolean; insights: AIInsight[] }>('POST', '/ai/insights', contextPayload),
};

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface ApiAnalyticsOverview {
  success: boolean;
  range: string;
  totalHeadcount: number;
  avgAttendance: string;
  totalPayroll: string;
  totalPayrollRaw: number;
  leaveUtilization: string;
  attritionRisk: string;
  attritionRiskProfile: Array<{
    department: string;
    riskScore: number;
    totalEmployees: number;
    inactiveEmployees: number;
  }>;
  headcountTrend: Array<{ name: string; headcount: number }>;
}

export const analyticsService = {
  getOverview: (range: string = '6m') =>
    request<ApiAnalyticsOverview>('GET', `/analytics/overview?range=${range}`),
  getAttendanceHeatmap: () => request<{ success: boolean; heatmap: any[] }>('GET', '/analytics/attendance-heatmap'),
  getAttritionRisk: () => request<{ success: boolean; attritionRisk: any[] }>('GET', '/analytics/attrition-risk'),
  getLeaveApprovalTrend: () => request<{ success: boolean; trend: any[] }>('GET', '/analytics/leave-approval-trend'),
  getPayrollDistribution: () => request<{ success: boolean; salaryDistribution: any[]; departmentPayrollCost: any[]; compensationBreakdown: any[] }>('GET', '/analytics/payroll-distribution'),
};

// ─── Documents ───────────────────────────────────────────────────────────────

export interface ApiDocument {
  _id: string;
  employeeId?: string | { _id: string; name: string; department: string; email?: string } | null;
  title: string;
  type: 'Offer Letter' | 'Payslip' | 'Policy' | 'Other' | 'ID Proof' | string;
  fileUrl: string;
  uploadedBy?: string | { _id: string; name: string; role?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export const documentService = {
  getAll: (employeeId?: string) => request<{ success: boolean; documents: ApiDocument[] }>('GET', employeeId ? `/documents?employeeId=${employeeId}` : '/documents'),
  upload: async (formData: FormData) => {
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
  type: 'Holiday' | 'Birthday' | 'Anniversary' | 'Training' | 'Meeting' | 'Other';
  description?: string;
  relatedEmployeeId?: string | { _id: string; name: string; department: string; role?: string };
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
  createEvent: (payload: { title: string; date: string; type: string; description?: string; relatedEmployeeId?: string }) =>
    request<{ success: boolean; event: ApiEvent; message: string }>('POST', '/company/events', payload),
  updateEvent: (id: string, payload: { title?: string; date?: string; type?: string; description?: string; relatedEmployeeId?: string }) =>
    request<{ success: boolean; event: ApiEvent; message: string }>('PUT', `/company/events/${id}`, payload),
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

// ─── Help Center ───────────────────────────────────────────────────────────

export interface ApiFAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ApiFAQCategory {
  id: string;
  label: string;
  icon: string;
  items: ApiFAQItem[];
}

const DEFAULT_FAQS: ApiFAQCategory[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: 'Rocket',
    items: [
      {
        id: 'account-access',
        question: 'How do I access my HRMSPro account?',
        answer: 'Use your company email and the password you received from HR. If you forgot your password, use the reset option on the login page.',
      },
      {
        id: 'dashboard-overview',
        question: 'What can I see on the dashboard?',
        answer: 'The dashboard shows attendance, approvals, payroll status, and quick links to key HR workflows.',
      },
    ],
  },
  {
    id: 'leave-payroll',
    label: 'Leave & Payroll',
    icon: 'Coins',
    items: [
      {
        id: 'leave-request',
        question: 'How do I request leave?',
        answer: 'Open the Leave section, select your dates, add a note, and submit the request for manager review.',
      },
      {
        id: 'payslip-download',
        question: 'Where can I download my payslip?',
        answer: 'Go to Payroll and open the latest payslip entry to download or preview your statement.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Security & Privacy',
    icon: 'Lock',
    items: [
      {
        id: 'account-security',
        question: 'How is my data protected?',
        answer: 'All sessions use secure authentication and sensitive actions are guarded by role-based permissions.',
      },
    ],
  },
];

export const helpCenterService = {
  getFAQs: async () => ({ success: true as const, categories: DEFAULT_FAQS }),
  seedFAQs: async () => ({ success: true as const, message: 'FAQs seeded successfully.', categories: DEFAULT_FAQS }),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export interface ApiNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'leave' | 'payroll' | 'attendance' | 'document' | 'system';
  read: boolean;
  link?: string | null;
  leaveId?: string | null;
  priority?: 'high' | 'normal';
  createdAt: string;
}

export const notificationService = {
  // Fetch all notifications + unread count for the logged-in user
  getAll: () =>
    request<{ success: boolean; notifications: ApiNotification[]; unreadCount: number }>(
      'GET', '/notifications'
    ),

  // Mark a single notification as read
  markAsRead: (id: string) =>
    request<{ success: boolean; notification: ApiNotification }>(
      'PUT', `/notifications/${id}/read`
    ),

  // Mark ALL notifications as read
  markAllAsRead: () =>
    request<{ success: boolean; message: string }>(
      'PUT', '/notifications/mark-all-read'
    ),

  // Delete a single notification
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(
      'DELETE', `/notifications/${id}`
    ),

  // Delete all read notifications (clear inbox)
  clearRead: () =>
    request<{ success: boolean; message: string }>(
      'DELETE', '/notifications/clear-read'
    ),

  // HR only: broadcast a notification
  create: (payload: { title: string; message: string; type?: string; targetUserId?: string; link?: string }) =>
    request<{ success: boolean; message: string }>(
      'POST', '/notifications', payload
    ),
};

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const taskService = {
  getAll: () => request<{ success: boolean; tasks: ApiTask[] }>('GET', '/tasks'),
  create: (title: string, priority?: string, employeeId?: string) =>
    request<{ success: boolean; task: ApiTask; message: string }>('POST', '/tasks', { title, priority, employeeId }),
  update: (id: string, payload: { title?: string; status?: string; priority?: string }) =>
    request<{ success: boolean; task: ApiTask; message: string }>('PUT', `/tasks/${id}`, payload),
  delete: (id: string) => request<{ success: boolean; message: string }>('DELETE', `/tasks/${id}`),
};

// ─── Onboarding ──────────────────────────────────────────────────────────────

export interface ApiOnboardingActivity {
  action: string;
  timestamp: string;
  details?: string;
}

export interface ApiOnboarding {
  _id: string;
  userId: string | { _id: string; name: string; email: string; role?: string };
  employeeId?: any;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    status: 'pending' | 'in_progress' | 'completed';
    completedAt?: string;
  }>;
  currentStepId: string;
  policyAccepted?: boolean;
  policyAcceptedAt?: string;
  reviewStatus?: 'In Progress' | 'Pending Review' | 'Approved' | 'Rejected';
  reviewNotes?: string;
  reviewedBy?: any;
  reviewedAt?: string;
  activityLogs?: ApiOnboardingActivity[];
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const onboardingService = {
  getState: () =>
    request<{ success: boolean; onboarding: ApiOnboarding }>('GET', '/onboarding'),

  updateState: (payload: { steps: any[]; currentStepId: string; completedAt?: string }) =>
    request<{ success: boolean; onboarding: ApiOnboarding }>('PUT', '/onboarding', payload),

  resetState: () =>
    request<{ success: boolean; onboarding: ApiOnboarding }>('POST', '/onboarding/reset'),

  submitProfile: (payload: { phone: string; dob: string; gender: string; address: string }) =>
    request<{ success: boolean }>('POST', '/onboarding/profile', payload),

  submitBank: (payload: { account: string; ifsc: string; bankName: string }) =>
    request<{ success: boolean }>('POST', '/onboarding/bank', payload),

  submitPolicy: (agreed: boolean) =>
    request<{ success: boolean; message: string }>('POST', '/onboarding/policy', { agreed }),

  completeOnboarding: () =>
    request<{ success: boolean; message: string; onboarding: ApiOnboarding }>('POST', '/onboarding/complete'),

  getPendingReviews: () =>
    request<{ success: boolean; onboardings: ApiOnboarding[] }>('GET', '/onboarding/pending-reviews'),

  reviewOnboarding: (id: string, action: 'Approve' | 'Reject', notes?: string) =>
    request<{ success: boolean; message: string; onboarding: ApiOnboarding }>('PATCH', `/onboarding/${id}/review-status`, { action, notes }),

  uploadDocuments: (formData: FormData) =>
    request<{ success: boolean }>('POST', '/onboarding/documents', formData, {
      headers: {
        'Accept': 'application/json'
      }
    }),
};
