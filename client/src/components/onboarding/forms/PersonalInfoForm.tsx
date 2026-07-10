import { motion } from 'framer-motion';

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

const GENDERS = ['Male', 'Female', 'Other'] as const;

export default function PersonalInfoForm({
  profileForm,
  setProfileForm,
  triggerAutoSave,
  profileError,
}: PersonalInfoFormProps) {

  const lbl = "block text-[10px] font-black uppercase tracking-widest mb-1.5 text-slate-400 dark:text-slate-500";
  const inp = (err = false) =>
    `w-full rounded-xl border text-sm font-semibold px-3.5 py-2.5 outline-none transition-all bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm
    ${err
      ? 'border-red-400 ring-2 ring-red-400/20 dark:border-red-500/60'
      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto flex flex-col gap-8 w-full"
    >
      <div className="text-center">
        <div className="mx-auto h-14 w-14 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-500/20 shadow-sm shadow-blue-500/10">
           <i className="ti ti-user-scan text-2xl" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Tell us about yourself</h3>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">We need this to set up your profile</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 dark:bg-white/5 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
        {/* Phone */}
        <motion.div
          animate={profileError && !profileForm.phone.trim() ? { x: [-6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <label htmlFor="phone" className={`${lbl} ${profileError && !profileForm.phone.trim() ? '!text-red-400' : ''}`}>
            Phone Number <span className="text-red-400">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={profileForm.phone}
            onChange={e => { setProfileForm({ ...profileForm, phone: e.target.value }); triggerAutoSave(); }}
            className={inp(profileError && !profileForm.phone.trim())}
          />
        </motion.div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dob" className={lbl}>Date of Birth</label>
        <input
          id="dob"
          type="date"
          value={profileForm.dob}
          onChange={e => { setProfileForm({ ...profileForm, dob: e.target.value }); triggerAutoSave(); }}
          className={`${inp()} cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-30 [&::-webkit-calendar-picker-indicator]:dark:invert`}
        />
      </div>

      {/* Gender */}
      <div className="sm:col-span-2">
        <label className={lbl}>Gender</label>
        <div className="flex gap-2">
          {GENDERS.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => { setProfileForm({ ...profileForm, gender: g }); triggerAutoSave(); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200
                ${profileForm.gender === g
                  ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      <motion.div
        className="sm:col-span-2"
        animate={profileError && !profileForm.address.trim() ? { x: [-6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <label htmlFor="address" className={`${lbl} ${profileError && !profileForm.address.trim() ? '!text-red-400' : ''}`}>
          Residential Address <span className="text-red-400">*</span>
        </label>
        <input
          id="address"
          type="text"
          placeholder="e.g. 123 MG Road, Bengaluru, Karnataka"
          value={profileForm.address}
          onChange={e => { setProfileForm({ ...profileForm, address: e.target.value }); triggerAutoSave(); }}
          className={inp(profileError && !profileForm.address.trim())}
        />
      </motion.div>
      </div>
    </motion.div>
  );
}
