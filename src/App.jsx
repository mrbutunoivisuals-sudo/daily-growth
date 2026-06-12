import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import NavBar    from './components/NavBar.jsx'
import Auth      from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Today     from './pages/Today.jsx'
import Coach     from './pages/Coach.jsx'
import Review    from './pages/Review.jsx'
import Settings  from './pages/Settings.jsx'

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px', boxShadow: 'var(--shadow-acc)',
        }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '-0.5px' }}>DG</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Se încarcă...</p>
      </div>
    </div>
  )
}

// ── Guards ────────────────────────────────────────────────────────────────────
function RequireOnboarding({ children }) {
  const { profile } = useApp()
  if (!profile?.onboardingDone) return <Navigate to="/onboarding" replace />
  return children
}

// ── Main routes (only rendered when session exists) ───────────────────────────
function AppRoutes() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/today"   element={<RequireOnboarding><Today /></RequireOnboarding>} />
        <Route path="/coach"   element={<RequireOnboarding><Coach /></RequireOnboarding>} />
        <Route path="/review"  element={<RequireOnboarding><Review /></RequireOnboarding>} />
        <Route path="/settings" element={<RequireOnboarding><Settings /></RequireOnboarding>} />
        <Route path="/"        element={<Navigate to="/today" replace />} />
        <Route path="*"        element={<Navigate to="/today" replace />} />
      </Routes>
    </>
  )
}

// ── Root: decides what to show based on auth state ────────────────────────────
function Root() {
  const { session, authLoading } = useApp()

  // Supabase is checking whether a persisted session exists — show nothing yet
  if (authLoading) return <LoadingScreen />

  // No session → show login screen (not inside Router routes, keeps it simple)
  if (!session) return <Auth />

  // Session exists → show the full app with routing
  return <AppRoutes />
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
              <Root />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}
