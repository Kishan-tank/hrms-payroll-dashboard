import { useState } from 'react';

const faqs = [
  {
    q: 'How secure is HRMSPro?',
    a: 'HRMSPro is designed with enterprise-grade security, role-based access control, encrypted data handling, and audit-ready workflows.',
  },
  {
    q: 'Can I migrate existing employee data?',
    a: 'Yes. HRMSPro supports importing employee, payroll, attendance, and leave records from existing spreadsheets or HR systems.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most teams can complete basic setup in under 10 minutes, while larger organizations can configure advanced workflows with guided onboarding.',
  },
  {
    q: 'Do you support multi-branch organizations?',
    a: 'Yes. HRMSPro supports departments, branches, roles, and location-wise workforce operations from a single dashboard.',
  },
  {
    q: 'Can HR managers generate payroll reports?',
    a: 'Yes. HR managers can process payroll, review salary breakdowns, and generate downloadable payroll reports.',
  },
  {
    q: 'Can employees download payslips?',
    a: 'Yes. Employees can securely access and download their monthly payslips from the employee portal.',
  },
  {
    q: 'Does HRMSPro support role-based access?',
    a: 'Yes. Employees and HR managers have separate dashboards, permissions, and restricted access based on their role.',
  },
  {
    q: 'Is this project ready for backend integration?',
    a: 'Yes. The frontend is structured to integrate with MERN stack APIs, JWT authentication, RBAC middleware, and MongoDB.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20" style={{ background: '#020617' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            FAQ
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-400">
            Everything you need to know about the product, billing, and technical integration.
          </p>
        </div>

        {/* Accordion - 2 Column Grid */}
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="group animate-fade-in-up flex h-fit flex-col overflow-hidden rounded-2xl transition-all duration-300"
                style={{
                  background: isOpen ? 'rgba(37,99,235,0.05)' : 'rgba(255,255,255,0.02)',
                  border: isOpen ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isOpen ? '0 0 30px rgba(37,99,235,0.12)' : 'none',
                  animationDelay: `${idx * 50}ms`
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="flex w-full items-center justify-between p-5 text-left focus:outline-none"
                >
                  <span className={`text-sm md:text-base transition-colors ${isOpen ? 'text-white font-extrabold' : 'text-slate-300 font-bold group-hover:text-white'}`}>
                    {faq.q}
                  </span>
                  <span
                    className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen ? 'bg-blue-600 text-white scale-110 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-white/5 text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400'
                    }`}
                  >
                    {isOpen ? (
                      <svg className="h-4 w-4 transition-transform duration-300 rotate-180" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 12h14" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 transition-transform duration-300 rotate-90" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Small FAQ CTA */}
        <div 
          className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[20px] p-4 sm:flex-row"
          style={{ 
            background: 'rgba(15,23,42,0.5)', 
            border: '1px solid rgba(37,99,235,0.2)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 30px rgba(37,99,235,0.05)'
          }}
        >
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-extrabold text-white">Still have questions?</h4>
            <p className="mt-0.5 text-[11px] text-slate-400">Talk to our HRMS specialists for tailored answers.</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Contact Sales
            </button>
            <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.6)]">
              Book Live Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
