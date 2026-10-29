import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  LogOut, 
  User as UserIcon, 
  MapPin, 
  QrCode, 
  GraduationCap, 
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, isFaculty, quickDemoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Attend<span className="text-brand-600">Ease</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  v2.4 Anti-Proxy
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Dynamic QR + Geofence Verification
              </p>
            </div>
          </div>

          {/* Center Tabs: Role Based */}
          {user && (
            <nav className="flex items-center space-x-1 sm:space-x-2">
              {isFaculty ? (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'dashboard'
                        ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Sessions & Audit</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('projector')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'projector'
                        ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-brand-600" />
                    <span>Live QR Screen</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('checkin')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'checkin'
                        ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Scan Attendance</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'history'
                        ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>My Records</span>
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Right: User Menu & Role Switcher */}
          {user ? (
            <div className="flex items-center space-x-3">
              {/* Quick switch demo profile badge */}
              <div className="hidden lg:flex items-center space-x-1 text-xs bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                <span className="text-slate-500">Test as:</span>
                <button
                  onClick={() => quickDemoLogin('FACULTY')}
                  className={`px-1.5 py-0.5 rounded font-medium ${
                    isFaculty ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Switch to Dr. Rajesh Sharma (Faculty)"
                >
                  Faculty
                </button>
                <button
                  onClick={() => quickDemoLogin('STUDENT1')}
                  className={`px-1.5 py-0.5 rounded font-medium ${
                    !isFaculty ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Switch to Alex Morgan (Student)"
                >
                  Student
                </button>
              </div>

              {/* User Profile Tag */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
                  {user.fullName?.split(' ').map((n) => n[0]).join('') || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {isFaculty ? 'Faculty / Admin' : `Roll: ${user.rollNumber || 'CS2026'}`}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Industry Grade Security</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
