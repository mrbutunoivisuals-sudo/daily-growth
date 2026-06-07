import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Target, Zap, BarChart2, CheckSquare, Flame, CalendarCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';

const NAV = [
  { to: '/dashboard',   icon: Home,          label: 'Acasă' },
  { to: '/coach',       icon: MessageCircle, label: 'Coach' },
  { to: '/habits',      icon: Zap,           label: 'Obiceiuri' },
  { to: '/challenges',  icon: Flame,         label: 'Provocări' },
  { to: '/checkin',     icon: CheckSquare,   label: 'Check-in' },
  { to: '/review',      icon: CalendarCheck, label: 'Review' },
  { to: '/life',        icon: BarChart2,     label: 'Scor' },
];

export default function NavBar() {
  const location = useLocation();
  const { morningDone, eveningDone } = useApp();
  const checkinPending = !morningDone || !eveningDone;

  const HIDDEN_ROUTES = ['/', '/onboarding', '/assessment', '/learning-profile'];
  if (HIDDEN_ROUTES.some(r => location.pathname === r)) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-16 flex-col items-center py-6 gap-1 z-50"
        style={{ background: 'rgba(10,10,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
          <span className="text-indigo-400 text-xs font-bold">DG</span>
        </div>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} title={label}
            className={({ isActive }) =>
              `relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {to === '/checkin' && checkinPending && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            )}
            <span className="absolute left-14 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
              {label}
            </span>
          </NavLink>
        ))}
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{ background: 'rgba(10,10,15,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-indigo-400' : 'text-slate-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-indigo-500/15" />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="relative z-10 text-[10px] leading-none">{label}</span>
                {to === '/checkin' && checkinPending && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
