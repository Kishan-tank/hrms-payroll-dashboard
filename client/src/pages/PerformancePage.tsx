import { useState, useEffect, useRef } from 'react';
import { Target, Award, Plus, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { performanceService, employeeService, ApiGoal, ApiPerformanceReview, ApiEmployee } from '../services/hrmsApi';
import { useAuthContext } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

export default function PerformancePage() {
  const { user } = useAuthContext();
  const isHrManager = user?.role === 'hr-manager';

  const [activeTab, setActiveTab] = useState<'goals' | 'reviews'>('goals');
  const [goals, setGoals] = useState<ApiGoal[]>([]);
  const [reviews, setReviews] = useState<ApiPerformanceReview[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Workspace selection for HR
  const [selectedWorkspaceEmpId, setSelectedWorkspaceEmpId] = useState<string>(''); // empty means "My Workspace"

  // Form states
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDueDate, setNewGoalDueDate] = useState('');
  
  const debounceRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});
  
  // HR Review form states
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewPeriod, setReviewPeriod] = useState('Q2 2026');
  const [managerFeedback, setManagerFeedback] = useState('');

  useEffect(() => {
    if (isHrManager) {
      employeeService.getAll({ limit: 100 }).then(res => setEmployees(res.employees)).catch(() => {});
    }
  }, [isHrManager]);

  useEffect(() => {
    fetchData();
  }, [selectedWorkspaceEmpId, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'goals') {
        const res = await performanceService.getGoals(selectedWorkspaceEmpId || undefined);
        setGoals(res.goals);
      } else if (activeTab === 'reviews') {
        const res = await performanceService.getReviews(selectedWorkspaceEmpId || undefined);
        setReviews(res.reviews);
      }
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
      const res = await performanceService.createGoal(newGoalTitle, newGoalDueDate || undefined, selectedWorkspaceEmpId || undefined);
      setGoals([res.goal, ...goals]);
      setNewGoalTitle('');
      setNewGoalDueDate('');
      setSuccessMsg('Goal created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    }
  };

  const handleUpdateGoalProgress = (id: string, progress: number) => {
    // Optimistic UI update
    setGoals(goals.map(g => (g._id === id ? { ...g, progress } : g)));

    if (debounceRef.current[id]) {
      clearTimeout(debounceRef.current[id]);
    }
    debounceRef.current[id] = setTimeout(async () => {
      try {
        const res = await performanceService.updateGoalProgress(id, progress);
        setGoals(prev => prev.map(g => (g._id === id ? res.goal : g)));
      } catch (err: any) {
        setError(err.message || 'Failed to update progress');
      }
    }, 500);
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await performanceService.deleteGoal(id);
      setGoals(goals.filter(g => g._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete goal');
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
      if (activeTab === 'reviews' && (!selectedWorkspaceEmpId || selectedWorkspaceEmpId === selectedEmpId)) {
        setReviews([res.review, ...reviews]);
      }
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
      {/* Ambient glows for consistency with other pages */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5 pb-8">
      
      {/* Simple Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Performance</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Track goals and review periods.
          </p>
        </div>
        
        {isHrManager && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Viewing:</label>
            <select
              value={selectedWorkspaceEmpId}
              onChange={e => setSelectedWorkspaceEmpId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
            >
              <option value="" className="dark:bg-[#111827]">My Workspace</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id} className="dark:bg-[#111827]">{emp.name} ({emp.department})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 shadow-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Standard Tabs */}
      <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-white/5 max-w-fit">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-all ${
            activeTab === 'goals'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Target className="h-4 w-4" />
          Goals
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-all ${
            activeTab === 'reviews'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Award className="h-4 w-4" />
          Reviews
        </button>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="mt-4">
          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
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
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Date</label>
                      <input
                        type="date"
                        value={newGoalDueDate}
                        onChange={e => setNewGoalDueDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Create Goal
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                {goals.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#0B1121]">
                    No goals defined yet. Set a new target!
                  </div>
                ) : (
                  goals.map(goal => (
                    <div key={goal._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{goal.title}</h4>
                          {goal.dueDate && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
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
                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
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

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="grid gap-6 lg:grid-cols-3">
              {isHrManager && (
                <div className="lg:col-span-1">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                    <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Submit Review</h3>
                    <form onSubmit={handleCreateReview} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Select Employee</label>
                        <select
                          required
                          value={selectedEmpId}
                          onChange={e => setSelectedEmpId(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        >
                          <option value="" className="dark:bg-[#111827]">-- Choose Employee --</option>
                          {employees.map(emp => (
                            <option key={emp._id} value={emp._id} className="dark:bg-[#111827]">{emp.name} ({emp.department})</option>
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
                          required
                          value={managerFeedback}
                          onChange={e => setManagerFeedback(e.target.value)}
                          placeholder="Detailed notes on achievements..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className={`space-y-4 ${isHrManager ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                {reviews.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#0B1121]">
                    No performance reviews available yet.
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                          {review.employeeId ? review.employeeId.name : 'Employee Review'}
                        </h4>
                        <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                          Score: {review.score} / 10
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {review.reviewPeriod} • Recorded on {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      
                      {review.managerFeedback && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-white/5 dark:border-white/5">
                          <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Feedback</h5>
                          <p className="text-sm text-slate-700 dark:text-slate-300">"{review.managerFeedback}"</p>
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
