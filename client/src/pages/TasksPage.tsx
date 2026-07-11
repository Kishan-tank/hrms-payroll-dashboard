import { useState, useEffect } from 'react';
import { Plus, Clock, Trash2, ListTodo, RefreshCw, ChevronDown } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { taskService, type ApiTask } from '../services/hrmsApi';
import { useToast } from '../context/ToastContext';

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

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
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
  const totalCount = tasks.length;

  return (
    <DashboardLayout title="Tasks">
      {/* Ambient glows for consistency */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5 pb-8">
        
        {/* Simple Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Task Workspace</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Manage deliverables, priorities, and progress.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchTasks}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/5"
              title="Refresh tasks"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-blue-500' : ''} />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm"
            >
              <Plus size={16} />
              {showAddForm ? 'Cancel' : 'New Task'}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Tasks', value: totalCount, color: '#3B82F6', abbr: 'TT' },
            { label: 'Pending', value: pendingCount, color: '#F59E0B', abbr: 'PD' },
            { label: 'In Progress', value: inProgressCount, color: '#6366F1', abbr: 'IP' },
            { label: 'Done', value: completedCount, color: '#10B981', abbr: 'DN' },
          ].map(({ label, value, color, abbr }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-white/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold"
                  style={{ background: `${color}18`, color }}
                >
                  {abbr}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {totalCount > 0 ? Math.round((value / totalCount) * 100) : 0}%
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Create Task Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateTask}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]"
          >
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Add New Task
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optimize Dashboard"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:bg-[#111827] dark:text-white border-slate-200 dark:border-white/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority Level</label>
                <div className="relative">
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-2 pr-8 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
                  >
                    <option value="Low" className="dark:bg-[#111827]">Low</option>
                    <option value="Medium" className="dark:bg-[#111827]">Medium</option>
                    <option value="High" className="dark:bg-[#111827]">High</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Submit Task'}
              </button>
            </div>
          </form>
        )}

        {/* Filters and Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 shrink-0">
              Status:
            </span>
            {(['ALL', 'Pending', 'In Progress', 'Done'] as const).map(status => {
              const isActive = filter === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0B1121] dark:text-slate-400 dark:hover:bg-white/[0.04]'
                  }`}
                  style={isActive ? { boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.2)' } : {}}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 shrink-0">
              Priority:
            </span>
            {(['ALL', 'Low', 'Medium', 'High'] as const).map(prio => {
              const isActive = priorityFilter === prio;
              return (
                <button
                  key={prio}
                  onClick={() => setPriorityFilter(prio)}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0B1121] dark:text-slate-400 dark:hover:bg-white/[0.04]'
                  }`}
                  style={isActive ? { boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.2)' } : {}}
                >
                  {prio}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-[#0B1121]">
            <ListTodo className="h-10 w-10 text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tasks found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or create a new task.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map(task => {
              const isDone = task.status === 'Done';
              return (
                <div
                  key={task._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 shadow-sm transition-all ${
                    isDone 
                      ? 'border-slate-100 bg-slate-50/50 dark:border-white/5 dark:bg-white/5' 
                      : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B1121]'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                      <select
                        value={task.status}
                        onChange={e => handleUpdateStatus(task._id, e.target.value)}
                        className={`shrink-0 cursor-pointer appearance-none rounded-lg border px-3 py-1.5 pr-7 text-[11px] font-black uppercase tracking-wider outline-none transition-colors ${
                          task.status === 'Done'
                            ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                            : task.status === 'In Progress'
                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <option value="Pending" className="dark:bg-[#111827]">Pending</option>
                        <option value="In Progress" className="dark:bg-[#111827]">In Progress</option>
                        <option value="Done" className="dark:bg-[#111827]">Done</option>
                      </select>
                      <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none ${isDone ? 'text-green-500' : task.status === 'In Progress' ? 'text-blue-500' : 'text-amber-500'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`truncate text-base font-bold transition-all ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {task.employeeId && typeof task.employeeId !== 'string' && (
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {task.employeeId.name}
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                          task.priority === 'High'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : task.priority === 'Medium'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Clock size={10} />
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
