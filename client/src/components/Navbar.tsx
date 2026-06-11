import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  title: string;
  userName?: string;
  userRole?: string;
}

const notifications = [
  { id: 1, text: 'New leave request from John Doe', time: '5m ago', unread: true },
  { id: 2, text: 'Payroll processed for May 2026', time: '1h ago', unread: true },
  { id: 3, text: '3 employees marked absent today', time: '3h ago', unread: false },
];

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function Navbar({ title, userName = 'Anil Kumar', userRole = 'Employee' }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <header className="sticky top-0 z-20 flex h-[88px] items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="sr-only">
        <h1>{title}</h1>
      </div>

      <div className="min-w-0 flex-1 md:max-w-[560px]">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search employees, payroll, reports..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-12 pr-4 text-lg text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications((value) => !value);
              setShowProfile(false);
            }}
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
            aria-label="Notifications"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-14 z-50 w-96 rounded-2xl border border-slate-200 bg-white py-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <div className="border-b border-slate-200 px-5 py-3 text-base font-bold text-slate-950">Notifications</div>
              {notifications.map((item) => (
                <button key={item.id} type="button" className="flex w-full gap-4 px-5 py-4 text-left hover:bg-slate-50">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.unread ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  <span>
                    <span className="block text-base font-medium text-slate-950">{item.text}</span>
                    <span className="mt-1 block text-sm text-slate-400">{item.time}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfile((value) => !value);
              setShowNotifications(false);
            }}
            className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 transition hover:border-blue-200"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-bold leading-tight text-slate-950">{userName}</span>
              <span className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-blue-600">
                <ShieldIcon />
                {userRole}
              </span>
            </span>
            <span className="text-slate-400">
              <ChevronIcon />
            </span>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-14 z-50 w-60 rounded-2xl border border-slate-200 bg-white py-3 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <div className="px-5 py-3 text-base font-bold text-slate-950">{userName}</div>
              <div className="px-5 pb-3 text-sm text-slate-400">{userRole}</div>
              <div className="my-1 border-t border-slate-200" />
              {[
                ['My Profile', '/profile'],
                ['Account Settings', '/settings'],
                ['Help & Support', '/reports'],
              ].map(([label, path]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className="w-full px-5 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
