interface NavbarProps {
  title: string;
  userName?: string;
  userRole?: string;
}

export default function Navbar({
  title,
  userName = 'Sai Anil',
  userRole = 'Employee',
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Page title */}
        <div>
          <p className="text-sm font-medium text-gray-500">Enterprise HRMS</p>
          <h1 className="text-lg font-semibold text-gray-950 sm:text-xl">{title}</h1>
        </div>

        {/* Signed-in user summary */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white shadow-sm">
            {userName
              .split(' ')
              .map((name) => name[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
