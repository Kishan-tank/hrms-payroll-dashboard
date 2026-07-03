import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Calendar, Award, Plus, Trash2, CheckCircle, AlertCircle, ThumbsUp, Sparkles, Users } from 'lucide-react';
=======
import { Calendar, Award, Plus, Trash2, CheckCircle, AlertCircle, ThumbsUp, Sparkles } from 'lucide-react';
>>>>>>> origin/main
import { companyService, ApiEvent, ApiSkill } from '../services/hrmsApi';
import { useAuthContext } from '../context/AuthContext';

export default function CompanyHubPage() {
  const { user } = useAuthContext();
  const isHrManager = user?.role === 'hr-manager';

  const [activeTab, setActiveTab] = useState<'events' | 'skills'>('events');
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [skills, setSkills] = useState<ApiSkill[]>([]);
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
      const [eventsRes, skillsRes] = await Promise.all([
        companyService.getEvents(),
        companyService.getSkills(),
      ]);
      setEvents(eventsRes.events);
      setSkills(skillsRes.skills);
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
      setEvents([res.event, ...events]);
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
      setSkills([res.skill, ...skills]);
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
      setSkills(skills.map(s => (s._id === id ? res.skill : s)));
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Company Hub & Talent Matrix</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Explore company events, training calendars, and team skill endorsements.</p>
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
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'events'
<<<<<<< HEAD
              ? 'border-blue-600 text-blue-600 dark:border-blue-50 dark:text-blue-400'
=======
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
>>>>>>> origin/main
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Upcoming Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'skills'
<<<<<<< HEAD
              ? 'border-blue-600 text-blue-600 dark:border-blue-50 dark:text-blue-400'
=======
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
>>>>>>> origin/main
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          Talent & Skills Matrix ({skills.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div>
          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="grid gap-8 lg:grid-cols-3">
              {isHrManager && (
                <div className="lg:col-span-1">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
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
                          <option value="Holiday">Holiday</option>
                          <option value="Birthday">Birthday</option>
                          <option value="Anniversary">Anniversary</option>
                          <option value="Training">Training</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" /> Add Event
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className={`space-y-4 ${isHrManager ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                {events.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#111827]">
                    No upcoming events found. Check back soon!
                  </div>
                ) : (
                  events.map(ev => (
                    <div key={ev._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
                      <div className="flex items-center gap-5">
                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                          <span className="text-xs font-bold uppercase leading-none">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg font-extrabold leading-tight">{new Date(ev.date).getDate()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${getBadgeColor(ev.type)}`}>
                              {ev.type}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Scheduled for {new Date(ev.date).toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
                  <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Add Your Skill</h3>
                  <form onSubmit={handleCreateSkill} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Skill Name</label>
                      <input
                        type="text"
                        required
                        value={newSkillName}
                        onChange={e => setNewSkillName(e.target.value)}
                        placeholder="e.g., React & Redux, Kubernetes, Negotiation"
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
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" /> Add Skill
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                {skills.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-400 dark:border-white/10 dark:bg-[#111827]">
                    No skills registered in the matrix yet. Be the first to add yours!
                  </div>
                ) : (
                  skills.map(skill => (
                    <div key={skill._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111827]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{skill.name}</h4>
                            <span className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-extrabold text-purple-600 dark:text-purple-400">
                              <Sparkles className="h-3 w-3" /> {skill.endorsements} Endorsements
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            By {skill.employeeId ? `${skill.employeeId.name} (${skill.employeeId.department} - ${skill.employeeId.role})` : 'Employee'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEndorseSkill(skill._id)}
                            className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition-all hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" /> Endorse (+1)
                          </button>
                          {isHrManager && (
                            <button
                              onClick={() => handleDeleteSkill(skill._id)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Proficiency Bar */}
                      <div className="mt-5">
                        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <span>Proficiency Level</span>
                          <span>{skill.proficiency}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
