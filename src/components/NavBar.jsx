import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const SunIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const ChatIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const BookIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)
const GearIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const NAV = [
  { to: '/today',   Icon: SunIcon,  label: 'Azi' },
  { to: '/coach',   Icon: ChatIcon, label: 'Coach' },
  { to: '/review',  Icon: BookIcon, label: 'Review' },
]

const HIDDEN = ['/onboarding']

export default function NavBar() {
  const location = useLocation()
  if (HIDDEN.some(r => location.pathname.startsWith(r))) return null

  const activeStyle = { color: 'var(--accent)' }
  const inactiveStyle = { color: '#9CA3AF' }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="nav-desktop">
        <div style={{
          width: 36, height: 36, borderRadius: 11, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: '-0.5px' }}>DG</span>
        </div>

        {NAV.map(({ to, Icon, label }) => (
          <NavLink key={to} to={to} title={label} style={({ isActive }) => ({
            width: 46, height: 46, borderRadius: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', transition: 'all 0.15s ease',
            color: isActive ? 'var(--accent)' : '#9CA3AF',
            background: isActive ? 'var(--accent-light)' : 'transparent',
          })}>
            <Icon size={22} />
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />

        <NavLink to="/settings" title="Setări" style={({ isActive }) => ({
          width: 44, height: 44, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', transition: 'all 0.15s ease',
          color: isActive ? 'var(--accent)' : '#9CA3AF',
          background: isActive ? 'var(--accent-light)' : 'transparent',
        })}>
          <GearIcon size={20} />
        </NavLink>
      </aside>

      {/* ── Mobile bottom bar ── */}
      <nav className="nav-bottom">
        {[...NAV, { to: '/settings', Icon: GearIcon, label: 'Setări' }].map(({ to, Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 14px', borderRadius: 12, textDecoration: 'none', minWidth: 52,
            color: isActive ? 'var(--accent)' : '#9CA3AF',
            fontWeight: isActive ? 600 : 400,
            fontSize: 10, letterSpacing: '0.01em',
            transition: 'color 0.15s ease',
          })}>
            {({ isActive }) => (
              <>
                <motion.div whileTap={{ scale: 0.85 }}>
                  <Icon size={22} />
                </motion.div>
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
