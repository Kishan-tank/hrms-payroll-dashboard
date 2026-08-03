import { useState, useEffect, useRef } from 'react';
import { Target, Award, Plus, Trash2, Edit3, CheckCircle, Clock, AlertCircle, X, User, Check, AlertTriangle } from 'lucide-react';
import { performanceService, employeeService, ApiGoal, ApiPerformanceReview, ApiEmployee } from '../services/hrmsApi';
import { useAuthContext } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

export default function PerformancePage() {
  const { user } = useAuthContext();
  const userRole = user?.role ? String(user.role).toLowerCase() : '';
  const isHrOrAdmin = userRole === 'admin' || userRole.includes('hr');

  const [activeTab, setActiveTab] = useState<'goals' | 'reviews'>('goals');
  const [goals, setGoals] = useState<ApiGoal[]>([]);
  const [reviews, setReviews] = useState<ApiPerformanceReview[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Workspace selection for HR
  const [selectedWorkspaceEmpId, setSelectedWorkspaceEmpId] = useState<string>(''); // empty means "My Workspace"

  // New Goal Form states
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalDueDate, setNewGoalDueDate] = useState('');
  const [newGoalProgress, setNewGoalProgress] = useState(0);

  // Edit Goal Modal state
  const [editingGoal, setEditingGoal] = useState<ApiGoal | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalDescription, setEditGoalDescription] = useState('');
  const [editGoalDueDate, setEditGoalDueDate] = useState('');
  const [editGoalProgress, setEditGoalProgress] = useState(0);
  const [editGoalStatus, setEditGoalStatus] = useState<string>('Not Started');

  // Delete Goal Confirm state
  const [deletingGoal, setDeletingGoal] = useState<ApiGoal | null>(null);

  // HR Review form states (Create)
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewPeriod, setReviewPeriod] = useState('Q2 2026');
  const [reviewStatus, setReviewStatus] = useState<'Draft' | 'Submitted' | 'Acknowledged'>('Submitted');
  const [managerFeedback, setManagerFeedback] = useState('');

  // Edit Review Modal state
  const [editingReview, setEditingReview] = useState<ApiPerformanceReview | null>(null);
  const [editReviewScore, setEditReviewScore] = useState(5);
  const [editReviewPeriod, setEditReviewPeriod] = useState('');
  const [editReviewStatus, setEditReviewStatus] = useState<'Draft' | 'Submitted' | 'Acknowledged'>('Submitted');
  const [editManagerFeedback, setEditManagerFeedback] = useState('');

  // Delete Review Confirm state
  const [deletingReview, setDeletingReview] = useState<ApiPerformanceReview | null>(null);

  const debounceRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    if (isHrOrAdmin) {
      employeeService.getAll({ limit: 100 }).then(res => setEmployees(res.employees)).catch(() => {});
    }
  }, [isHrOrAdmin]);

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

  // ── GOAL HANDLERS ───────────────────────────────────────────────────────────

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle) return;
    try {
      const res = await performanceService.createGoal({
        title: newGoalTitle,
        description: newGoalDescription,
        dueDate: newGoalDueDate || undefined,
        progress: newGoalProgress,
        employeeId: selectedWorkspaceEmpId || undefined,
      });
      setGoals([res.goal, ...goals]);
      setNewGoalTitle('');
      setNewGoalDescription('');
      setNewGoalDueDate('');
      setNewGoalProgress(0);
      setSuccessMsg('Goal created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    }
  };

  const handleUpdateGoalProgress = (id: string, progress: number) => {
    // Optimistic UI update
    setGoals(goals.map(g => {
      if (g._id === id) {
        let status = g.status;
        if (progress >= 100) status = 'Completed';
        else if (progress > 0) status = 'In Progress';
        return { ...g, progress, status };
      }
      return g;
    }));

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
    }, 400);
  };

  const openEditGoalModal = (goal: ApiGoal) => {
    setEditingGoal(goal);
    setEditGoalTitle(goal.title);
    setEditGoalDescription(goal.description || '');
    setEditGoalDueDate(goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : '');
    setEditGoalProgress(goal.progress || 0);
    setEditGoalStatus(goal.status || 'Not Started');
  };

  const handleSaveGoalEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    try {
      const res = await performanceService.updateGoal(editingGoal._id, {
        title: editGoalTitle,
        description: editGoalDescription,
        dueDate: editGoalDueDate || undefined,
        progress: editGoalProgress,
        status: editGoalStatus,
      });
      setGoals(goals.map(g => (g._id === editingGoal._id ? res.goal : g)));
      setEditingGoal(null);
      setSuccessMsg('Goal updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update goal');
    }
  };

  const handleConfirmDeleteGoal = async () => {
    if (!deletingGoal) return;
    try {
      await performanceService.deleteGoal(deletingGoal._id);
      setGoals(goals.filter(g => g._id !== deletingGoal._id));
      setDeletingGoal(null);
      setSuccessMsg('Goal deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete goal');
    }
  };

  // ── REVIEW HANDLERS ──────────────────────────────────────────────────────────

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) {
      setError('Please select an employee');
      return;
    }
    try {
      const res = await performanceService.createReview(selectedEmpId, reviewScore, reviewPeriod, managerFeedback, reviewStatus);
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

  const openEditReviewModal = (review: ApiPerformanceReview) => {
    setEditingReview(review);
    setEditReviewScore(review.score);
    setEditReviewPeriod(review.reviewPeriod);
    setEditReviewStatus(review.status || 'Submitted');
    setEditManagerFeedback(review.managerFeedback || '');
  };

  const handleSaveReviewEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    try {
      const res = await performanceService.updateReview(editingReview._id, {
        score: editReviewScore,
        reviewPeriod: editReviewPeriod,
        managerFeedback: editManagerFeedback,
        status: editReviewStatus,
      });
      setReviews(reviews.map(r => (r._id === editingReview._id ? res.review : r)));
      setEditingReview(null);
      setSuccessMsg('Review updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update review');
    }
  };

  const handleConfirmDeleteReview = async () => {
    if (!deletingReview) return;
    try {
      await performanceService.deleteReview(deletingReview._id);
      setReviews(reviews.filter(r => r._id !== deletingReview._id));
      setDeletingReview(null);
      setSuccessMsg('Review deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
    }
  };

  // Status Badge Renderers
  const renderGoalStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Clock className="h-3.5 w-3.5 animate-spin" /> In Progress
          </span>
        );
      case 'Missed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" /> Missed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-400/30 bg-slate-500/10 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" /> Not Started
          </span>
        );
    }
  };

  const renderReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'Acknowledged':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" /> Acknowledged
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" /> Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            <CheckCircle className="h-3.5 w-3.5" /> Submitted
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Performance">
      {/* Ambient glows for consistency */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5 pb-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Performance</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Track goals, progress, and review cycles.
            </p>
          </div>
          
          {isHrOrAdmin && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Viewing:</label>
              <select
                value={selectedWorkspaceEmpId}
                onChange={e => setSelectedWorkspaceEmpId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
              >
                <option value="" className="dark:bg-[#111827]">My Workspace (All Team)</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id} className="dark:bg-[#111827]">{emp.name} ({emp.department})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => setError('')} className="p-1 hover:opacity-75"><X className="h-4 w-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 shadow-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg('')} className="p-1 hover:opacity-75"><X className="h-4 w-4" /></button>
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
            
            {/* ════════════════════════ GOALS TAB ════════════════════════ */}
            {activeTab === 'goals' && (
              <div className="grid gap-6 lg:grid-cols-3">
                
                {/* Sidebar Add Goal Form */}
                <div className="lg:col-span-1">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                    <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Plus className="h-5 w-5 text-blue-600" /> Add New Goal
                    </h3>
                    <form onSubmit={handleCreateGoal} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Goal Title *</label>
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
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
                        <textarea
                          rows={2}
                          value={newGoalDescription}
                          onChange={e => setNewGoalDescription(e.target.value)}
                          placeholder="Key deliverables or milestones..."
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
                      <div>
                        <label className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <span>Initial Progress</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{newGoalProgress}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={newGoalProgress}
                          onChange={e => setNewGoalProgress(Number(e.target.value))}
                          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-white/10"
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

                {/* Main Goals Grid */}
                <div className="space-y-4 lg:col-span-2">
                  {goals.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#0B1121]">
                      <Target className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-medium">No goals defined yet. Set a new target!</p>
                    </div>
                  ) : (
                    goals.map(goal => {
                      const empObj = typeof goal.employeeId === 'object' ? goal.employeeId : null;
                      return (
                        <div key={goal._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 dark:border-white/10 dark:bg-[#0B1121]">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{goal.title}</h4>
                                {renderGoalStatusBadge(goal.status)}
                                {empObj && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                    <User className="h-3 w-3" /> {empObj.name}
                                  </span>
                                )}
                              </div>

                              {goal.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-300">{goal.description}</p>
                              )}

                              {goal.dueDate && (
                                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Target Date: {new Date(goal.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditGoalModal(goal)}
                                title="Edit Goal"
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeletingGoal(goal)}
                                title="Delete Goal"
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Progress Bar & Interactive Slider */}
                          <div className="mt-5">
                            <div className="mb-2 flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                              <span>Progress</span>
                              <span className="text-blue-600 dark:text-blue-400">{goal.progress}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={goal.progress}
                              onChange={e => handleUpdateGoalProgress(goal._id, Number(e.target.value))}
                              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-white/10"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ════════════════════════ REVIEWS TAB ════════════════════════ */}
            {activeTab === 'reviews' && (
              <div className="grid gap-6 lg:grid-cols-3">
                {isHrOrAdmin && (
                  <div className="lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" /> Submit Review
                      </h3>
                      <form onSubmit={handleCreateReview} className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee *</label>
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
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Review Period *</label>
                          <input
                            type="text"
                            required
                            value={reviewPeriod}
                            onChange={e => setReviewPeriod(e.target.value)}
                            placeholder="e.g. Q3 2026 or Annual 2026"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <span>Score</span>
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
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</label>
                          <select
                            value={reviewStatus}
                            onChange={e => setReviewStatus(e.target.value as any)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          >
                            <option value="Submitted" className="dark:bg-[#111827]">Submitted (Official)</option>
                            <option value="Draft" className="dark:bg-[#111827]">Draft (In Progress)</option>
                            <option value="Acknowledged" className="dark:bg-[#111827]">Acknowledged</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Manager Feedback</label>
                          <textarea
                            rows={3}
                            required
                            value={managerFeedback}
                            onChange={e => setManagerFeedback(e.target.value)}
                            placeholder="Detailed evaluation, strengths, areas for growth..."
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

                <div className={`space-y-4 ${isHrOrAdmin ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  {reviews.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#0B1121]">
                      <Award className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-medium">No performance reviews available yet.</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                {review.employeeId ? review.employeeId.name : 'Employee Review'}
                              </h4>
                              <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                Score: {review.score} / 10
                              </span>
                              {renderReviewStatusBadge(review.status)}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Period: <strong className="text-slate-700 dark:text-slate-200">{review.reviewPeriod}</strong>
                              {review.reviewerId?.name && (
                                <span> • Reviewer: <strong className="text-slate-700 dark:text-slate-200">{review.reviewerId.name}</strong></span>
                              )}
                              <span> • {new Date(review.createdAt).toLocaleDateString()}</span>
                            </p>
                          </div>

                          {/* HR / Admin Edit/Delete Actions */}
                          {isHrOrAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditReviewModal(review)}
                                title="Edit Review"
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeletingReview(review)}
                                title="Delete Review"
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>

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

        {/* ════════════════════════ EDIT GOAL MODAL ════════════════════════ */}
        {editingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0B1121]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Goal</h3>
                <button onClick={() => setEditingGoal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSaveGoalEdit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={editGoalTitle}
                    onChange={e => setEditGoalTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
                  <textarea
                    rows={3}
                    value={editGoalDescription}
                    onChange={e => setEditGoalDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Date</label>
                    <input
                      type="date"
                      value={editGoalDueDate}
                      onChange={e => setEditGoalDueDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</label>
                    <select
                      value={editGoalStatus}
                      onChange={e => setEditGoalStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="Not Started" className="dark:bg-[#111827]">Not Started</option>
                      <option value="In Progress" className="dark:bg-[#111827]">In Progress</option>
                      <option value="Completed" className="dark:bg-[#111827]">Completed</option>
                      <option value="Missed" className="dark:bg-[#111827]">Missed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{editGoalProgress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editGoalProgress}
                    onChange={e => setEditGoalProgress(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-white/10"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingGoal(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════════════ DELETE GOAL CONFIRM MODAL ════════════════════════ */}
        {deletingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0B1121]">
              <div className="mb-3 flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="rounded-full bg-red-100 p-2 dark:bg-red-500/10">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Goal</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{deletingGoal.title}"</strong>? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingGoal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteGoal}
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════ EDIT REVIEW MODAL ════════════════════════ */}
        {editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0B1121]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Performance Review</h3>
                <button onClick={() => setEditingReview(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSaveReviewEdit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Review Period</label>
                  <input
                    type="text"
                    required
                    value={editReviewPeriod}
                    onChange={e => setEditReviewPeriod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>Performance Score</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{editReviewScore} / 10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editReviewScore}
                    onChange={e => setEditReviewScore(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-white/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</label>
                  <select
                    value={editReviewStatus}
                    onChange={e => setEditReviewStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <option value="Submitted" className="dark:bg-[#111827]">Submitted</option>
                    <option value="Draft" className="dark:bg-[#111827]">Draft</option>
                    <option value="Acknowledged" className="dark:bg-[#111827]">Acknowledged</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Manager Feedback</label>
                  <textarea
                    rows={4}
                    required
                    value={editManagerFeedback}
                    onChange={e => setEditManagerFeedback(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════════════ DELETE REVIEW CONFIRM MODAL ════════════════════════ */}
        {deletingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0B1121]">
              <div className="mb-3 flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="rounded-full bg-red-100 p-2 dark:bg-red-500/10">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Review</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete the performance review for <strong className="text-slate-900 dark:text-white">"{deletingReview.employeeId?.name || 'Employee'}"</strong> ({deletingReview.reviewPeriod})? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingReview(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteReview}
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
