import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../context/AuthContext';
import { Search, ZoomIn, ZoomOut, Maximize, AlertCircle, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { mockOrgHierarchy, OrgNode } from '../components/org/mockOrgData';
import OrgEmployeePreviewDrawer from '../components/org/OrgEmployeePreviewDrawer';

// Helper to determine department color
const getDeptColor = (dept: string) => {
  switch (dept) {
    case 'Executive': return 'bg-purple-500';
    case 'Engineering': return 'bg-blue-500';
    case 'Human Resources': return 'bg-emerald-500';
    case 'Sales': return 'bg-amber-500';
    default: return 'bg-slate-500';
  }
};

// Tree Node Component
const TreeNode = ({ 
  node, 
  onNodeClick, 
  searchQuery 
}: { 
  node: OrgNode, 
  onNodeClick: (n: OrgNode) => void,
  searchQuery: string
}) => {
  const [expanded, setExpanded] = useState(true);
  
  // Auto-expand if search query matches any child
  const matchesSearch = searchQuery && (
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    node.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <motion.div 
        layout
        onClick={() => onNodeClick(node)}
        className={`relative z-10 flex w-64 cursor-pointer flex-col items-center rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition-all hover:scale-105 hover:shadow-xl dark:border-white/10 dark:bg-[#0B1121]/80 ${matchesSearch ? 'ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-[#0B1121]' : ''}`}
      >
        <div className={`absolute top-0 h-1.5 w-full rounded-t-2xl ${getDeptColor(node.department)}`} />
        
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-extrabold text-slate-700 shadow-inner dark:bg-slate-800 dark:text-slate-200">
          {node.avatar}
        </div>
        
        <h3 className="mt-3 text-center text-sm font-bold text-slate-900 dark:text-white">{node.name}</h3>
        <p className="mt-1 text-center text-xs font-semibold text-blue-600 dark:text-blue-400">{node.role}</p>
        <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{node.department}</p>
        
        {hasChildren && (
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="absolute -bottom-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative mt-8 flex flex-wrap justify-center gap-8 pt-8 before:absolute before:-top-8 before:left-1/2 before:h-16 before:w-px before:-translate-x-1/2 before:bg-slate-300 dark:before:bg-slate-700"
          >
            {/* Horizontal line connecting children */}
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-[calc(10%)] right-[calc(10%)] h-px bg-slate-300 dark:bg-slate-700" />
            )}
            
            {node.children!.map((child) => (
              <div key={child.id} className="relative before:absolute before:-top-8 before:left-1/2 before:h-8 before:w-px before:-translate-x-1/2 before:bg-slate-300 dark:before:bg-slate-700">
                <TreeNode node={child} onNodeClick={onNodeClick} searchQuery={searchQuery} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function OrgChartPage() {
  const { user } = useAuthContext();
  const [scale, setScale] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<OrgNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Role validation
  const normalizedRole = user?.role?.toLowerCase() || '';
  const isHR = ['hr-manager', 'hr manager', 'hr', 'admin'].includes(normalizedRole);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.4));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!isHR) {
    return (
      <DashboardLayout title="Organization Chart">
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-400">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">
            The organizational chart is restricted to HR and administrative personnel only.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Organization Chart">
      <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#0B1121]">
        
        {/* Toolbar */}
        <div className="relative z-20 flex flex-col items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Company Hierarchy</h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">
                  Demo Hierarchy
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:hover:border-white/20 dark:focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-slate-950">
              <button onClick={handleZoomOut} className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                <ZoomOut className="h-4 w-4" />
              </button>
              <button onClick={handleResetZoom} className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" title="Reset view">
                <Maximize className="h-4 w-4" />
              </button>
              <button onClick={handleZoomIn} className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        >
          <motion.div
            animate={{ x: position.x, y: position.y, scale }}
            transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.5 }}
            className="absolute left-1/2 top-12 origin-top -translate-x-1/2 pb-32"
          >
            <TreeNode 
              node={mockOrgHierarchy} 
              onNodeClick={setSelectedEmployee} 
              searchQuery={searchQuery}
            />
          </motion.div>
        </div>
      </div>

      <OrgEmployeePreviewDrawer 
        open={!!selectedEmployee} 
        onClose={() => setSelectedEmployee(null)} 
        employee={selectedEmployee} 
      />
    </DashboardLayout>
  );
}
