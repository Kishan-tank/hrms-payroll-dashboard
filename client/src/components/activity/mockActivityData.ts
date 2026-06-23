export type ActivityType = 'employee' | 'leave' | 'payroll' | 'attendance' | 'document' | 'system';

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  type: ActivityType;
  timestamp: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  metadata?: string;
  route?: string;
}

// TODO: Replace with backend audit log endpoint when available
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    actor: 'Anil Kumar',
    action: 'approved leave request for',
    target: 'Priya Nair',
    type: 'leave',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    severity: 'success',
    metadata: 'Annual leave — 4 days',
    route: '/leave'
  },
  {
    id: 'log-002',
    actor: 'System',
    action: 'processed',
    target: 'June 2026 Payroll',
    type: 'payroll',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    severity: 'success',
    metadata: '1,284 employees paid',
    route: '/payroll'
  },
  {
    id: 'log-003',
    actor: 'Sneha Rao',
    action: 'uploaded',
    target: 'Aadhaar Document',
    type: 'document',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
    severity: 'info',
    route: '/documents'
  },
  {
    id: 'log-004',
    actor: 'System',
    action: 'flagged late attendance for',
    target: 'Rahul Mehta',
    type: 'attendance',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    severity: 'warning',
    metadata: 'Check-in at 09:45 AM',
    route: '/attendance'
  },
  {
    id: 'log-005',
    actor: 'System',
    action: 'generated',
    target: 'Monthly Payroll Summary',
    type: 'system',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    severity: 'info'
  },
  {
    id: 'log-006',
    actor: 'Priya Sharma',
    action: 'joined as',
    target: 'Product Designer',
    type: 'employee',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    severity: 'info',
    route: '/employees'
  }
];
