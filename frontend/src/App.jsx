import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import FacultyDashboard from './pages/FacultyDashboard';
import LiveQrProjector from './components/LiveQrProjector';
import StudentQrScanner from './components/StudentQrScanner';
import StudentHistory from './components/StudentHistory';
import { ShieldCheck, RefreshCw } from 'lucide-react';

function AppContent() {
  const { user, loading, isFaculty, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectorSessionId, setProjectorSessionId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="p-4 rounded-2xl bg-white shadow-xl border border-slate-200 flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-brand-600 animate-spin" />
          <span className="text-sm font-bold text-slate-700">Loading AttendEase Security Core...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar activeTab="" setActiveTab={() => {}} />
        <main className="flex-1">
          <AuthPage />
        </main>
      </div>
    );
  }

  const handleOpenProjector = (sessionId) => {
    setProjectorSessionId(sessionId);
    setActiveTab('projector');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {isFaculty ? (
          activeTab === 'projector' ? (
            <LiveQrProjector initialSessionId={projectorSessionId} />
          ) : (
            <FacultyDashboard onOpenProjector={handleOpenProjector} />
          )
        ) : (
          activeTab === 'history' ? (
            <StudentHistory />
          ) : (
            <StudentQrScanner onAttendanceSuccess={() => {}} />
          )
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
