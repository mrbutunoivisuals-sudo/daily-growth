import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding.jsx';
import Assessment from './pages/Assessment.jsx';
import LearningProfile from './pages/LearningProfile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Session from './pages/Session.jsx';
import Domains from './pages/Domains.jsx';
import Settings from './pages/Settings.jsx';

function RequireProfile({ children }) {
  const profile = localStorage.getItem('dg_userProfile');
  if (!profile) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
        <div className="fixed inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 60%)',
        }} />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/learning-profile" element={<LearningProfile />} />
            <Route path="/dashboard" element={<RequireProfile><Dashboard /></RequireProfile>} />
            <Route path="/session/:domainId" element={<RequireProfile><Session /></RequireProfile>} />
            <Route path="/domains" element={<RequireProfile><Domains /></RequireProfile>} />
            <Route path="/settings" element={<RequireProfile><Settings /></RequireProfile>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
