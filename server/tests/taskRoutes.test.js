import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mock } from 'node:test';
import app from '../src/app.js';
import Task from '../src/models/Task.js';
import Employee from '../src/models/employee.js';
import { getTasks, createTask, updateTask } from '../src/controllers/taskController.js';

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

function createChainableQuery(result) {
  return {
    populate: () => ({
      sort: async () => result,
    }),
  };
}

test('tasks route is protected and returns 401 without a token', async () => {
  const server = app.listen(0);
  await once(server, 'listening');

  try {
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const response = await fetch(`${baseUrl}/api/tasks`);

    assert.equal(response.status, 401);
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});

test('getTasks filters tasks to the current employee for employee role', async () => {
  const employeeLookup = mock.method(Employee, 'findOne', async () => ({ _id: 'employee-1' }));
  const taskLookup = mock.method(Task, 'find', () => createChainableQuery([{ _id: 'task-1' }]));

  const req = { user: { role: 'employee', _id: 'user-1' } };
  const res = createRes();

  await getTasks(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(taskLookup.mock.calls[0].arguments[0], { employeeId: 'employee-1' });
  assert.equal(employeeLookup.mock.callCount(), 1);

  mock.restoreAll();
});

test('getTasks returns all tasks for HR/Admin roles', async () => {
  const employeeLookup = mock.method(Employee, 'findOne', async () => ({ _id: 'employee-1' }));
  const taskLookup = mock.method(Task, 'find', () => createChainableQuery([{ _id: 'task-1' }]));

  const req = { user: { role: 'hr', _id: 'user-1' } };
  const res = createRes();

  await getTasks(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(taskLookup.mock.calls[0].arguments[0], {});
  assert.equal(employeeLookup.mock.callCount(), 0);

  mock.restoreAll();
});

test('createTask assigns the task to the current employee profile', async () => {
  const employeeLookup = mock.method(Employee, 'findOne', async () => ({ _id: 'employee-1' }));
  const createTaskMock = mock.method(Task, 'create', async (data) => ({ _id: 'task-1', ...data }));
  const findByIdMock = mock.method(Task, 'findById', () => ({
    _id: 'task-1',
    employeeId: 'employee-1',
    title: 'Write docs',
    populate: () => ({})
  }));

  const req = {
    user: { role: 'employee', _id: 'user-1' },
    body: { title: 'Write docs' }
  };
  const res = createRes();

  await createTask(req, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(createTaskMock.mock.calls[0].arguments[0], {
    employeeId: 'employee-1',
    title: 'Write docs',
    priority: 'Medium',
    status: 'Pending'
  });
  assert.equal(employeeLookup.mock.callCount(), 1);
  assert.equal(findByIdMock.mock.callCount(), 1);

  mock.restoreAll();
});

test('updateTask denies employees from updating another employee task', async () => {
  const taskLookup = mock.method(Task, 'findById', async () => ({
    _id: 'task-2',
    employeeId: 'employee-2'
  }));
  const employeeLookup = mock.method(Employee, 'findOne', async () => ({ _id: 'employee-1' }));
  const updateMock = mock.method(Task, 'findByIdAndUpdate', async () => ({}));

  const req = {
    user: { role: 'employee', _id: 'user-1' },
    params: { id: 'task-2' },
    body: { status: 'Done' }
  };
  const res = createRes();

  await updateTask(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(taskLookup.mock.callCount(), 1);
  assert.equal(employeeLookup.mock.callCount(), 1);
  assert.equal(updateMock.mock.callCount(), 0);

  mock.restoreAll();
});
