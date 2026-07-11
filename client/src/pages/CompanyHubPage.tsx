import { useState, useEffect } from 'react';
import { Calendar, Award, Plus, Trash2, CheckCircle, AlertCircle, ThumbsUp, Sparkles, User } from 'lucide-react';
import { companyService, employeeService, ApiEvent, ApiSkill } from '../services/hrmsApi';
import { useAuthContext } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

export default function CompanyHubPage() {
  const { user } = useAuthContext();
  const isHrManager = user?.role === 'hr-manager';

  const [activeTab, setActiveTab] = useState<'events' | 'skills'>('events');
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Event form states
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventType, setNewEventType] = useState<'Holiday' | 'Birthday' | 'Anniversary' | 'Training'>('Holiday');

  // Skill form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState(80);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [eventsRes, skillsRes, meRes] = await Promise.all([
        companyService.getEvents(),
        companyService.getSkills(),
        employeeService.getMe().catch(() => ({ employee: null })),
      ]);
      setEvents(eventsRes.events);
      setSkills(skillsRes.skills);
      if (meRes?.employee) {
        setCurrentEmployeeId(meRes.employee._id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch company hub data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    try {
      const res = await companyService.createEvent(newEventTitle, newEventDate, newEventType);
      setEvents([res.event, ...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setNewEventTitle('');
      setNewEventDate('');
      setSuccessMsg('Event added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await companyService.deleteEvent(id);
      setEvents(events.filter(ev => ev._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName) return;
    try {
      const res = await companyService.createSkill(newSkillName, newSkillProficiency);
      setSkills([res.skill, ...skills].sort((a, b) => b.endorsements - a.endorsements));
      setNewSkillName('');
      setNewSkillProficiency(80);
      setSuccessMsg('Skill added to your profile successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add skill');
    }
  };

  const handleEndorseSkill = async (id: string) => {
    try {
      const res = await companyService.endorseSkill(id);
      setSkills(skills.map(s => (s._id === id ? res.skill : s)).sort((a, b) => b.endorsements - a.endorsements));
      setSuccessMsg('Skill endorsed successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to endorse skill');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await companyService.deleteSkill(id);
      setSkills(skills.filter(s => s._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete skill');
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Holiday': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400';
      case 'Birthday': return 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400';
      case 'Anniversary': return 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400';
      case 'Training': return 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
    }
  };

  return (
    <DashboardLayout title="Company Hub">
      {/* Ambient glows for consistency with other pages */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5 pb-8">
      {/* Simple Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Company Hub</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {isHrManager ? 'Manage events and talent matrix.' : 'Explore company events and talent matrix.'}
          </p>
        </div>
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
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Events
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-all ${
            activeTab === 'skills'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Award className="h-4 w-4" />
          Talent Matrix
        </button>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="mt-4">
          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="grid gap-6 lg:grid-cols-3">
              {isHrManager && (
                <div className="lg:col-span-1">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                    <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Add Company Event</h3>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Event Title</label>
                        <input
                          type="text"
                          required
                          value={newEventTitle}
                          onChange={e => setNewEventTitle(e.target.value)}
                          placeholder="e.g., Annual Hackathon 2026"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Event Date</label>
                        <input
                          type="date"
                          required
                          value={newEventDate}
                          onChange={e => setNewEventDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Event Type</label>
                        <select
                          value={newEventType}
                          onChange={e => setNewEventType(e.target.value as any)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        >
                          <option value="Holiday" className="dark:bg-[#111827]">Holiday</option>
                          <option value="Birthday" className="dark:bg-[#111827]">Birthday</option>
                          <option value="Anniversary" className="dark:bg-[#111827]">Anniversary</option>
                          <option value="Training" className="dark:bg-[#111827]">Training</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm"
                      >
                        <Plus className="h-4 w-4" /> Add Event
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className={`space-y-4 ${isHrManager ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                {events.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#0B1121]">
                    No upcoming events found. Check back soon!
                  </div>
                ) : (
                  events.map(ev => (
                    <div key={ev._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                          <span className="text-[10px] font-bold uppercase leading-none">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg font-extrabold leading-tight">{new Date(ev.date).getDate()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(ev.type)}`}>
                              {ev.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(ev.date).toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      {isHrManager && (
                        <button
                          onClick={() => handleDeleteEvent(ev._id)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                  <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Add Your Skill</h3>
                  <form onSubmit={handleCreateSkill} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Skill Name</label>
                      <input
                        type="text"
                        required
                        value={newSkillName}
                        onChange={e => setNewSkillName(e.target.value)}
                        placeholder="e.g., React & Redux"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <span>Proficiency</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{newSkillProficiency}%</span>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={newSkillProficiency}
                        onChange={e => setNewSkillProficiency(Number(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-white/10"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Add Skill
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                {skills.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#0B1121]">
                    No skills registered in the matrix yet. Be the first to add yours!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {skills.map((skill) => {
                      const isOwner = currentEmployeeId && skill.employeeId && skill.employeeId._id === currentEmployeeId;
                      
                      return (
                      <div key={skill._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-base font-bold text-slate-900 dark:text-white">{skill.name}</h4>
                              <span className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                <Sparkles className="h-3 w-3" /> {skill.endorsements} Endorsements
                              </span>
                            </div>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <User className="h-3.5 w-3.5" /> 
                              {skill.employeeId ? `${skill.employeeId.name} (${skill.employeeId.department})` : 'Unknown Employee'}
                              {isOwner && <span className="text-blue-500 font-semibold">(You)</span>}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEndorseSkill(skill._id)}
                              className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" /> Endorse
                            </button>
                            {(isHrManager || isOwner) && (
                              <button
                                onClick={() => handleDeleteSkill(skill._id)}
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                title="Delete Skill"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Proficiency Bar */}
                        <div className="mt-4">
                          <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span>Proficiency</span>
                            <span>{skill.proficiency}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
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
