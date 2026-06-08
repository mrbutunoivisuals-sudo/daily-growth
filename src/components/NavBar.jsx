import { NavLink, useLocation } from 'react-router-dom';

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const NAV = [
  { to: '/dashboard', icon: SunIcon,  label: 'Azi' },
  { to: '/coach',     icon: ChatIcon, label: 'Coach' },
  { to: '/review',    icon: BookIcon, label: 'Review' },
];

const HIDDEN = ['/onboarding'];

export default function NavBar() {
  const location = useLocation();
  if (HIDDEN.some(r => location.pathname.startsWith(r))) return null;

  const activeStyle = { color: '#0071E3' };
  const inactiveStyle = { color: '#6E6E73' };

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, height: '100%', width: 64,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 24, paddingBottom: 24, gap: 4, zIndex: 50,
      }} className="hidden md:flex">
        {/* Logo mark */}
        <div style={{
          width: 32, height: 32, borderRadius: 10, background: '#0071E3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>DG</span>
        </div>

        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} title={label} style={({ isActive }) => ({
            width: 44, height: 44, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s ease',
            background: 'transparent',
            textDecoration: 'none',
            ...(isActive ? { ...activeStyle, background: '#E8F0FB' } : inactiveStyle),
          })}>
            <Icon />
          </NavLink>
        ))}

        {/* Gear — spacer at bottom */}
        <div style={{ flex: 1 }} />
        <NavLink to="/settings" title="Setări" style={({ isActive }) => ({
          width: 40, height: 40, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
          ...(isActive ? { ...activeStyle, background: '#E8F0FB' } : inactiveStyle),
        })}>
          <GearIcon />
        </NavLink>
      </aside>

      {/* Mobile bottom bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 0',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }} className="md:hidden">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 16px', borderRadius: 10, textDecoration: 'none',
            fontSize: 10, fontWeight: 500, letterSpacing: '0.02em',
            transition: 'color 0.15s ease',
            ...(isActive ? activeStyle : inactiveStyle),
          })}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink to="/settings" style={({ isActive }) => ({
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '6px 12px', borderRadius: 10, textDecoration: 'none',
          fontSize: 10, fontWeight: 500,
          ...(isActive ? activeStyle : inactiveStyle),
        })}>
          <GearIcon />
          <span>Setări</span>
        </NavLink>
      </nav>
    </>
  );
}
