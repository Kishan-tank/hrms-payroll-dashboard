
import { useState, useEffect } from 'react';
import { Target, CheckSquare, Award, Plus, Trash2, CheckCircle, Clock, AlertCircle, UserCheck } from 'lucide-react';
import { performanceService, employeeService, ApiGoal, ApiTask, ApiPerformanceReview, ApiEmployee } from '../services/hrmsApi';
import { useAuthContext } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

export default function PerformancePage() {
  const { user } = useAuthContext();
  const isHrManager = user?.role === 'hr-manager';

  const [activeTab, setActiveTab] = useState<'goals' | 'tasks' | 'reviews'>('goals');
  const [goals, setGoals] = useState<ApiGoal[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [reviews, setReviews] = useState<ApiPerformanceReview[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDueDate, setNewGoalDueDate] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  
  // HR Review form states
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewPeriod, setReviewPeriod] = useState('Q2 2026');
  const [managerFeedback, setManagerFeedback] = useState('');

  useEffect(() => {
    fetchData();
    if (isHrManager) {
      employeeService.getAll({ limit: 100 }).then(res => setEmployees(res.employees)).catch(() => {});
    }
  }, [isHrManager]);
const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [goalsRes, tasksRes, reviewsRes] = await Promise.all([
        performanceService.getGoals(),
        performanceService.getTasks(),
        performanceService.getReviews(),
      ]);
      setGoals(goalsRes.goals);
      setTasks(tasksRes.tasks);
      setReviews(reviewsRes.reviews);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch performance data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle) return;
    try {
      const res = await performanceService.createGoal(newGoalTitle, newGoalDueDate || undefined);
      setGoals([res.goal, ...goals]);
      setNewGoalTitle('');
      setNewGoalDueDate('');
      setSuccessMsg('Goal created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    }
  };

  const handleUpdateGoalProgress = async (id: string, progress: number) => {
    try {
      const res = await performanceService.updateGoalProgress(id, progress);
      setGoals(goals.map(g => (g._id === id ? res.goal : g)));
    } catch (err: any) {
      setError(err.message || 'Failed to update progress');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await performanceService.deleteGoal(id);
      setGoals(goals.filter(g => g._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete goal');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      const res = await performanceService.createTask(newTaskTitle, newTaskPriority);
      setTasks([res.task, ...tasks]);
      setNewTaskTitle('');
      setSuccessMsg('Task created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: string) => {
    try {
      const res = await performanceService.updateTaskStatus(id, status);
      setTasks(tasks.map(t => (t._id === id ? res.task : t)));
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await performanceService.deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) {
      setError('Please select an employee');
      return;
    }
    try {
      const res = await performanceService.createReview(selectedEmpId, reviewScore, reviewPeriod, managerFeedback);
      setReviews([res.review, ...reviews]);
      setSelectedEmpId('');
      setManagerFeedback('');
      setSuccessMsg('Performance review submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    }
  };

  return (
    <DashboardLayout title="Performance">
      <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Performance & Productivity</h1>
          <p className="text-sm text-slate-50-slate-500 dark:text-slate-400">Track professional goals, active task boards, and review periods.</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'goals'
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Target className="h-4 w-4" />
          Goals ({goals.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'tasks'
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'reviews'
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          Performance Reviews ({reviews.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div>
          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
                  <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Add New Goal</h3>
                  <form onSubmit={handleCreateGoal} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Goal Title</label>
                      <input
                        type="text"
                        required
                        value={newGoalTitle}
                        onChange={e => setNewGoalTitle(e.target.value)}
                        placeholder="e.g., Complete AWS Certification"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Date</label>
                      <input
                        type="date"
                        value={newGoalDueDate}
                        onChange={e => setNewGoalDueDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" /> Create Goal
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                {goals.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#111827]">
                    No goals defined yet. Set your first goal above!
                  </div>
                ) : (
                  goals.map(goal => (
                    <div key={goal._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{goal.title}</h4>
                          {goal.dueDate && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <Clock className="h-3.5 w-3.5" /> Due: {new Date(goal.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteGoal(goal._id)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Progress Bar & Range */}
                      <div className="mt-6">
                        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={e => handleUpdateGoalProgress(goal._id, Number(e.target.value))}
                          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-white/10"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
                  <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Add New Task</h3>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Task Description</label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="e.g., Update API documentation"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={e => setNewTaskPriority(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" /> Add Task
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                {tasks.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#111827]">
                    No active tasks. You're all caught up!
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
                      <div className="flex items-center gap-4">
                        <select
                          value={task.status}
                          onChange={e => handleUpdateTaskStatus(task._id, e.target.value)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider outline-none ${
                            task.status === 'Done'
                              ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                              : task.status === 'In Progress'
                              ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                        <div>
                          <h4 className={`text-base font-bold ${task.status === 'Done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                            {task.title}
                          </h4>
                          <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                            task.priority === 'High'
                              ? 'bg-red-500/10 text-red-500'
                              : task.priority === 'Medium'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-slate-500/10 text-slate-500'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="grid gap-8 lg:grid-cols-3">
              {isHrManager && (
                <div className="lg:col-span-1">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
                    <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Submit Official Review</h3>
                    <form onSubmit={handleCreateReview} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Select Employee</label>
                        <select
                          required
                          value={selectedEmpId}
                          onChange={e => setSelectedEmpId(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        >
                          <option value="">-- Choose Employee --</option>
                          {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Review Period</label>
                        <input
                          type="text"
                          required
                          value={reviewPeriod}
                          onChange={e => setReviewPeriod(e.target.value)}
                          placeholder="e.g. Q1 2026 or Annual 2026"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <span>Performance Score</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{reviewScore} / 10</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={reviewScore}
                          onChange={e => setReviewScore(Number(e.target.value))}
                          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-white/10"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Manager Feedback</label>
                        <textarea
                          rows={3}
                          value={managerFeedback}
                          onChange={e => setManagerFeedback(e.target.value)}
                          placeholder="Detailed notes on achievements and areas of improvement..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
                      >
                        <UserCheck className="h-4 w-4" /> Submit Review
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className={`space-y-4 ${isHrManager ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                {reviews.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#111827]">
                    No performance reviews available yet.
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                              {review.employeeId ? review.employeeId.name : 'Employee Review'}
                            </h4>
                            <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                              Score: {review.score} / 10
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            Period: {review.reviewPeriod} • Recorded on {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {review.managerFeedback && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-white/5 dark:border-white/5">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Manager Feedback</h5>
                          <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{review.managerFeedback}"</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}

