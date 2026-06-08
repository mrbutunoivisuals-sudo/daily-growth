import { NavLink, useLocation } from 'react-router-dom';

const SunIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const ChatIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const BookIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const GearIcon = ({ size = 19 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const NAV = [
  { to: '/dashboard', Icon: SunIcon,  label: 'Azi' },
  { to: '/coach',     Icon: ChatIcon, label: 'Coach' },
  { to: '/review',    Icon: BookIcon, label: 'Review' },
];

const HIDDEN = ['/onboarding'];

export default function NavBar() {
  const location = useLocation();
  if (HIDDEN.some(r => location.pathname.startsWith(r))) return null;

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex" style={{
        position: 'fixed', left: 0, top: 0, height: '100%', width: 68,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        flexDirection: 'column', alignItems: 'center',
        paddingTop: 24, paddingBottom: 24, gap: 6, zIndex: 50,
      }}>
        {/* Logo mark */}
        <div style={{
          width: 36, height: 36, borderRadius: 11, background: '#0071E3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '-0.5px' }}>DG</span>
        </div>

        {NAV.map(({ to, Icon, label }) => (
          <NavLink key={to} to={to} title={label} style={({ isActive }) => ({
            width: 46, height: 46, borderRadius: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
            transition: 'background 0.15s ease, color 0.15s ease',
            color: isActive ? '#0071E3' : '#8E8E93',
            background: isActive ? '#E8F0FB' : 'transparent',
          })}>
            <Icon />
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />

        <NavLink to="/settings" title="Setări" style={({ isActive }) => ({
          width: 42, height: 42, borderRadius: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
          transition: 'background 0.15s ease, color 0.15s ease',
          color: isActive ? '#0071E3' : '#8E8E93',
          background: isActive ? '#E8F0FB' : 'transparent',
        })}>
          <GearIcon />
        </NavLink>
      </aside>

      {/* ── Mobile bottom bar ── */}
      <nav className="md:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        height: 64,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {[...NAV, { to: '/settings', Icon: GearIcon, label: 'Setări' }].map(({ to, Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 14px', borderRadius: 12,
            textDecoration: 'none', minWidth: 52,
            color: isActive ? '#0071E3' : '#8E8E93',
            fontWeight: isActive ? 600 : 400,
            fontSize: 10, letterSpacing: '0.01em',
            transition: 'color 0.15s ease',
          })}>
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
