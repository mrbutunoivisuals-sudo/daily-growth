import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import NavBar from './components/NavBar.jsx';

import Onboarding    from './pages/Onboarding.jsx';
import Dashboard     from './pages/Dashboard.jsx';
import Coach         from './pages/Coach.jsx';
import Goals         from './pages/Goals.jsx';
import Habits        from './pages/Habits.jsx';
import CheckIn       from './pages/CheckIn.jsx';
import LifeScore     from './pages/LifeScore.jsx';
import Session       from './pages/Session.jsx';
import Domains       from './pages/Domains.jsx';
import Settings      from './pages/Settings.jsx';
import Challenges    from './pages/Challenges.jsx';
import Review        from './pages/Review.jsx';

function RequireProfile({ children }) {
  const { profile } = useApp();
  if (!profile?.onboardingDone) return <Navigate to="/onboarding" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard"  element={<RequireProfile><Dashboard /></RequireProfile>} />
        <Route path="/coach"      element={<RequireProfile><Coach /></RequireProfile>} />
        <Route path="/goals"      element={<RequireProfile><Goals /></RequireProfile>} />
        <Route path="/habits"     element={<RequireProfile><Habits /></RequireProfile>} />
        <Route path="/checkin"    element={<RequireProfile><CheckIn /></RequireProfile>} />
        <Route path="/life"       element={<RequireProfile><LifeScore /></RequireProfile>} />
        <Route path="/session/:domainId" element={<RequireProfile><Session /></RequireProfile>} />
        <Route path="/domains"    element={<RequireProfile><Domains /></RequireProfile>} />
        <Route path="/settings"   element={<RequireProfile><Settings /></RequireProfile>} />
        <Route path="/challenges" element={<RequireProfile><Challenges /></RequireProfile>} />
        <Route path="/review"     element={<RequireProfile><Review /></RequireProfile>} />
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
          <div className="fixed inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.10) 0%, transparent 60%)',
          }} />
          <div className="relative z-10">
            <AppRoutes />
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
