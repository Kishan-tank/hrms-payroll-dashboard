import { motion, AnimatePresence } from 'framer-motion';

export interface ProfileFormState {
  phone: string;
  dob: string;
  gender: string;
  address: string;
}

interface PersonalInfoFormProps {
  profileForm: ProfileFormState;
  setProfileForm: (form: ProfileFormState) => void;
  triggerAutoSave: () => void;
  profileError: boolean;
  renderAITips: (text: string) => React.ReactNode;
}

export default function PersonalInfoForm({
  profileForm,
  setProfileForm,
  triggerAutoSave,
  profileError,
  renderAITips
}: PersonalInfoFormProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 grid gap-6 sm:grid-cols-2 max-w-4xl">
        <div className="relative group">
          <input
            id="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={profileForm.phone}
            onChange={e => { setProfileForm({ ...profileForm, phone: e.target.value }); triggerAutoSave(); }}
            className="peer w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 pb-2.5 pt-7 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all hover:bg-slate-50 hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder-transparent dark:border-white/5 dark:bg-[#111827]/50 dark:hover:bg-[#111827] dark:focus:bg-[#0B1121] shadow-sm"
          />
          <label htmlFor="phone" className="absolute left-5 top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-bold peer-placeholder-shown:text-slate-500 peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:font-black peer-focus:text-blue-600 dark:peer-placeholder-shown:text-slate-500 dark:peer-focus:text-blue-400 pointer-events-none">
            Phone Number <span className="text-red-500">*</span>
          </label>
        </div>

        <div className="relative group">
          <input
            id="dob"
            type="date"
            placeholder=" "
            value={profileForm.dob}
            onChange={e => { setProfileForm({ ...profileForm, dob: e.target.value }); triggerAutoSave(); }}
            className="peer w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 pb-2.5 pt-7 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all hover:bg-slate-50 hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/5 dark:bg-[#111827]/50 dark:hover:bg-[#111827] dark:focus:bg-[#0B1121] shadow-sm"
          />
          <label htmlFor="dob" className="absolute left-5 top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all peer-focus:text-blue-600 dark:peer-focus:text-blue-400 pointer-events-none">
            Date of Birth
          </label>
        </div>

        <div className="relative group col-span-1 sm:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">
            Gender
          </label>
          <div className="grid grid-cols-3 gap-3 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-white/5 shadow-inner">
            {['Male', 'Female', 'Other'].map(g => (
              <button
                key={g}
                onClick={() => { setProfileForm({ ...profileForm, gender: g }); triggerAutoSave(); }}
                className={`rounded-xl py-3 text-sm font-bold transition-all duration-300 ${
                  profileForm.gender === g
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-[#111827] dark:text-white ring-1 ring-slate-200/50 dark:ring-white/10 scale-[1.02]'
                    : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-slate-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group col-span-1 sm:col-span-2">
          <input
            id="address"
            type="text"
            placeholder="e.g. 123 MG Road, Bengaluru"
            value={profileForm.address}
            onChange={e => { setProfileForm({ ...profileForm, address: e.target.value }); triggerAutoSave(); }}
            className="peer w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 pb-2.5 pt-7 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all hover:bg-slate-50 hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder-transparent dark:border-white/5 dark:bg-[#111827]/50 dark:hover:bg-[#111827] dark:focus:bg-[#0B1121] shadow-sm"
          />
          <label htmlFor="address" className="absolute left-5 top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-bold peer-placeholder-shown:text-slate-500 peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:font-black peer-focus:text-blue-600 dark:peer-placeholder-shown:text-slate-500 dark:peer-focus:text-blue-400 pointer-events-none">
            Residential Address <span className="text-red-500">*</span>
          </label>
        </div>

        <AnimatePresence>
          {profileError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="col-span-1 sm:col-span-2 flex items-center gap-3 bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-100 dark:border-red-500/20">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <i className="ti ti-alert-triangle text-lg" />
              </div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">Please fill in all required fields marked with an asterisk (*).</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        {renderAITips("Keeping your profile updated ensures seamless payroll processing and accurate tax document delivery. Your residential address is required for mandatory HR compliance.")}
      </div>
    </motion.div>
  );
}
