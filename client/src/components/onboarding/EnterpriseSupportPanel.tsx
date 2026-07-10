import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SupportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentStepId: string;
}

export default function EnterpriseSupportPanel({ isOpen, onClose, currentStepId }: SupportPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // 4. Smart Guidance
  const smartTips: Record<string, string> = {
    profile: 'Make sure your name matches your government ID exactly.',
    documents: 'Upload high-resolution scans. Max file size is 10MB per document.',
    bank: 'Your IFSC code determines the routing branch for your salary.',
    handbook: 'You must read and acknowledge all policies before proceeding.',
  };

  // 2. Help Center FAQs
  const faqs = [
    { q: 'How long does background verification take?', a: 'Typically 3-5 business days. You will be notified via email once complete.' },
    { q: 'What if my bank is not listed?', a: 'Contact your HR representative to add a manual bank entry to our system.' },
    { q: 'Can I change my details later?', a: 'Yes, most details can be updated in your Employee Profile after onboarding is completed.' },
    { q: 'Who do I contact for payroll questions?', a: 'Your assigned HR Partner can direct your queries to the payroll department.' }
  ];

  const filteredFaqs = faqs.filter(faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#0B1121] shadow-2xl z-[101] border-l border-slate-200 dark:border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 ring-4 ring-blue-50 dark:ring-blue-500/5">
                    <i className="ti ti-headset text-xl" />
                 </div>
                 <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Help Center</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Enterprise Support</p>
                 </div>
              </div>
              <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" aria-label="Close panel">
                <i className="ti ti-x text-xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
               
               {/* 3. Support Status */}
               <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                 <div className="flex flex-col gap-1">
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Avg Response Time</span>
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">~ 15 mins</span>
                 </div>
                 <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
                 <div className="flex flex-col text-right gap-1">
                   <span className="flex items-center gap-1.5 justify-end text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                     </span>
                     HR Online
                   </span>
                   <span className="text-[10px] font-bold text-slate-400">Updated just now</span>
                 </div>
               </div>

               {/* 1. HR Contact Card */}
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Your Assigned HR</h4>
                  <div className="p-5 rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-col gap-5">
                     <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 text-xl font-bold relative">
                           SJ
                           <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0B1121]" />
                        </div>
                        <div>
                           <h5 className="font-black text-slate-900 dark:text-white text-base">Sarah Jenkins</h5>
                           <p className="text-[11px] font-bold text-slate-500 mt-0.5">People Operations • 9 AM - 5 PM</p>
                        </div>
                     </div>
                     <div className="flex gap-2.5">
                        <button className="flex-1 py-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-black hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors flex justify-center items-center gap-2 active:scale-95">
                           <i className="ti ti-messages text-lg" /> Chat
                        </button>
                        <button className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-black hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex justify-center items-center gap-2 active:scale-95">
                           <i className="ti ti-calendar-plus text-lg" /> Schedule
                        </button>
                     </div>
                     <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                        <i className="ti ti-mail" /> sarah.j@company.com
                     </div>
                  </div>
               </div>

               {/* 4. Smart Guidance */}
               {smartTips[currentStepId] && (
                  <div className="p-5 rounded-[24px] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 flex gap-4 items-start shadow-inner">
                     <div className="h-10 w-10 shrink-0 rounded-2xl bg-white dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/30">
                        <i className="ti ti-bulb text-xl animate-pulse" />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1.5">Smart Tip</h4>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{smartTips[currentStepId]}</p>
                     </div>
                  </div>
               )}

               {/* 2. Help Center (FAQ) */}
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Frequently Asked Questions</h4>
                  <div className="relative mb-5">
                     <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                     <input
                       type="text"
                       placeholder="Search for answers..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-11 pr-4 py-3.5 rounded-[20px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-900 dark:text-white transition-all shadow-sm"
                     />
                  </div>

                  <div className="flex flex-col gap-3">
                     {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
                        <div key={i} className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0B1121] shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-colors">
                           <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between transition-colors">
                              <span className={`text-sm font-bold pr-4 transition-colors ${expandedFaq === i ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{faq.q}</span>
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${expandedFaq === i ? 'bg-blue-50 dark:bg-blue-500/10' : 'bg-slate-50 dark:bg-white/5'}`}>
                                <i className={`ti ti-chevron-down text-slate-400 transition-transform duration-300 ${expandedFaq === i ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                              </div>
                           </button>
                           <AnimatePresence>
                              {expandedFaq === i && (
                                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                                    <div className="px-5 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                                       {faq.a}
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     )) : (
                        <div className="text-center py-10 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                           <div className="h-12 w-12 rounded-full bg-white dark:bg-[#0B1121] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300 mx-auto mb-3">
                             <i className="ti ti-search text-xl" />
                           </div>
                           <p className="text-sm font-bold text-slate-500">No results found for "{searchQuery}"</p>
                        </div>
                     )}
                  </div>
               </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
