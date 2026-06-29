import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Clock, Trash2, ShieldAlert, Filter, ListTodo, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { taskService, type ApiTask } from '../services/hrmsApi';
import { useToast } from '../context/ToastContext';
import { useAuthContext } from '../context/AuthContext';

export default function TasksPage() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'Pending' | 'In Progress' | 'Done'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'Low' | 'Medium' | 'High'>('ALL');
  
  // New task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();
  const { user } = useAuthContext();
  const isHrManager = user?.role === 'hr-manager' || user?.role === 'hr';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskService.getAll();
      if (res.success) {
        setTasks(res.tasks || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Task title is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await taskService.create(newTitle, newPriority);
      if (res.success && res.task) {
        setTasks([res.task, ...tasks]);
        setNewTitle('');
        setShowAddForm(false);
        toast.success('Task created successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Pending' ? 'In Progress' : currentStatus === 'In Progress' ? 'Done' : 'Pending';
    try {
      const res = await taskService.update(id, { status: nextStatus });
      if (res.success && res.task) {
        setTasks(tasks.map(t => t._id === id ? res.task : t));
        toast.success(`Task marked as ${nextStatus}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await taskService.delete(id);
      if (res.success) {
        setTasks(tasks.filter(t => t._id !== id));
        toast.success('Task deleted successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter !== 'ALL' && t.status !== filter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'Done').length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;

  return (
    <DashboardLayout title="Task Management">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-emerald-600/8 blur-[130px]" />
        <div className="absolute left-[15%] top-[40%] h-[40vw] w-[40vw] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-6 pb-16 max-w-7xl mx-auto">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B1121] to-slate-900 p-8 shadow-2xl dark:border-white/10 dark:from-[#0B1121] dark:to-[#111827]">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/20">
                <ListTodo size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Task Workspace</h1>
                <p className="mt-1 text-sm font-medium text-slate-400">Manage sprint deliverables, set priorities, and track execution progress.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTasks}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/50 text-slate-300 backdrop-blur-xl transition-all hover:bg-slate-800 hover:text-white active:scale-95"
                title="Refresh tasks"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin text-emerald-400' : ''} />
              </button>
              
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-emerald-700 active:scale-95"
              >
                <Plus size={20} />
                <span>{showAddForm ? 'Close Form' : 'New Task'}</span>
              </button>
            </div>
          </div>

          {/* Stat metrics row */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Tasks</span>
              <span className="text-2xl font-extrabold text-white mt-1">{tasks.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Done</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1">{completedCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">In Progress</span>
              <span className="text-2xl font-extrabold text-blue-400 mt-1">{inProgressCount}</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Pending</span>
              <span className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Create Task Form Modal/Expandable */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleCreateTask}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0B1121]"
            >
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus size={20} className="text-emerald-500" /> Create New Sprint Task
              </h2>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Optimize React re-renders in dashboard header"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white dark:border-white/10 dark:bg-[#111827] dark:text-white dark:focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white dark:border-white/10 dark:bg-[#111827] dark:text-white dark:focus:border-emerald-500"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:border-white/5 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Submit Task'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Filters and Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#0B1121]">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
              <Filter size={14} /> Status:
            </span>
            {(['ALL', 'Pending', 'In Progress', 'Done'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                  filter === status
                    ? 'bg-emerald-600/15 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 dark:border-white/5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
              <AlertCircle size={14} /> Priority:
            </span>
            {(['ALL', 'Low', 'Medium', 'High'] as const).map(prio => (
              <button
                key={prio}
                onClick={() => setPriorityFilter(prio)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                  priorityFilter === prio
                    ? 'bg-blue-600/15 text-blue-600 border border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                }`}
              >
                {prio}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 py-16 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
              <ListTodo size={32} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">No tasks found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your filters or create a new task to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredTasks.map(task => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white p-5 transition-all duration-300 hover:shadow-lg dark:bg-[#0B1121] ${
                    task.status === 'Done'
                      ? 'border-emerald-500/20 bg-emerald-50/20 dark:border-emerald-500/10 dark:bg-emerald-500/[0.02]'
                      : 'border-slate-200 hover:border-blue-500/30 dark:border-white/5 dark:hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleUpdateStatus(task._id, task.status)}
                      className="mt-1 shrink-0 transition-transform hover:scale-110 active:scale-95"
                      title="Click to change status"
                    >
                      {task.status === 'Done' ? (
                        <CheckCircle2 size={24} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      ) : task.status === 'In Progress' ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                        </div>
                      ) : (
                        <Circle size={24} className="text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500" />
                      )}
                    </button>

                    <div className="flex flex-col gap-1">
                      <span className={`text-base font-bold tracking-tight transition-colors ${
                        task.status === 'Done' ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-900 dark:text-white'
                      }`}>
                        {task.title}
                      </span>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        {task.employeeId && (
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            👤 {task.employeeId.name} ({task.employeeId.department})
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest border ${
                        task.priority === 'High'
                          ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                          : task.priority === 'Medium'
                          ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
                      }`}>
                        {task.priority}
                      </span>

                      <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest border ${
                        task.status === 'Done'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : task.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                          : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/5 dark:bg-white/5 dark:text-slate-500 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
