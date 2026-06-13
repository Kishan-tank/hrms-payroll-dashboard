import { Link } from 'react-router-dom';

const footerLinks = {
  Product: ['Employee Management', 'Payroll Automation', 'Attendance & Time Tracking', 'Leave Management', 'Analytics & Reports', 'Compliance'],
  Solutions: ['For Startups', 'For SMEs', 'For Enterprises', 'For HR Managers', 'For Finance Teams', 'Multi-Branch Organizations'],
  Resources: ['Documentation', 'API Reference', 'Blog', 'Case Studies', 'Help Center'],
  Company: ['About Us', 'Careers', 'Press Kit', 'Partners', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Security', 'GDPR', 'Cookie Policy'],
};

function BuildingIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function FooterSection() {
  return (
    <footer style={{ background: '#020817', borderTop: '1px solid rgba(37,99,235,0.1)' }}>
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6">
        {/* Top section */}
        <div className="mb-16 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          
          {/* Brand & Social Column */}
          <div className="max-w-xs">
            <Link to="/" className="group relative mb-6 flex items-center gap-3">
              {/* Premium Logo Glow */}
              <div className="pointer-events-none absolute left-0 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-40" style={{ background: '#60a5fa' }} />
              
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <BuildingIcon />
              </span>
              <span className="relative z-10 text-xl font-extrabold tracking-tight text-white">
                HRMS<span className="text-blue-500 transition-colors duration-300 group-hover:text-blue-400">Pro</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              The enterprise-grade HRMS platform that powers HR and payroll operations for organizations across India.
            </p>
            {/* Social icons */}
            <div className="mt-8 flex gap-4">
              {[
                { icon: <LinkedInIcon />, label: 'LinkedIn' },
                { icon: <TwitterIcon />, label: 'X (Twitter)' },
                { icon: <GitHubIcon />, label: 'GitHub' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-all duration-300"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = '#60a5fa';
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(96,165,250,0.5)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(59,130,246,0.25)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:ml-12">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="mb-5 text-sm font-bold text-white">{category}</h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="group relative inline-flex pb-0.5 text-sm font-medium text-slate-400 transition-colors duration-300 hover:text-blue-400">
                        {link}
                        <span className="absolute bottom-0 left-0 h-px w-0 bg-blue-400 transition-all duration-300 group-hover:w-full" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="flex flex-col items-center justify-between gap-6 pt-8 sm:flex-row" 
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Left */}
          <div className="flex flex-col text-center sm:text-left sm:flex-row sm:gap-1.5">
            <p className="text-sm font-medium text-slate-500">
              © 2026 HRMSPro Technologies Pvt. Ltd.
            </p>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">|</p>
            <p className="text-sm font-medium text-slate-500">All rights reserved.</p>
          </div>
          
          {/* Center */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['Privacy', 'Terms', 'Security', 'Sitemap'].map((item) => (
              <a key={item} href="#" className="group relative inline-flex pb-0.5 text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-white">
                {item}
                <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Right Status Pill */}
          <div className="flex shrink-0 items-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-transform duration-300 hover:scale-105"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
