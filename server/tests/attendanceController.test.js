import test from 'node:test';
import assert from 'node:assert/strict';
import { mock } from 'node:test';
import { regularizeAttendance } from '../src/controllers/attendanceController.js';
import Employee from '../src/models/employee.js';
import Attendance from '../src/models/attendance.js';

function createRes() {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

test('regularizeAttendance stores the reason and resolves the employee by user id', async () => {
  const employeeLookup = mock.method(Employee, 'findOne', async () => ({ _id: 'employee-1', userId: 'user-1' }));
  const attendanceLookup = mock.method(Attendance, 'findOne', async () => ({
    checkIn: '09:00 AM',
    checkOut: '05:00 PM',
    status: 'Present',
    save: async function () {
      this.saved = true;
    }
  }));

  const req = {
    user: { id: 'user-1', email: 'employee@example.com' },
    body: { date: '2026-07-08', reason: 'Doctor appointment', checkIn: '09:30 AM', checkOut: '05:30 PM' }
  };
  const res = createRes();

  await regularizeAttendance(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(employeeLookup.mock.callCount(), 1);
  assert.equal(attendanceLookup.mock.callCount(), 1);
  assert.equal(attendanceLookup.mock.calls[0].arguments[0].employeeId, 'employee-1');
  assert.equal(attendanceLookup.mock.calls[0].arguments[0].date, '2026-07-08');
  assert.equal(res.body.record.reason, 'Doctor appointment');
  assert.equal(res.body.record.status, 'Pending');

  mock.restoreAll();
});
