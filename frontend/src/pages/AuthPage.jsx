import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  MapPin, 
  QrCode, 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function AuthPage() {
  const { login, register, quickDemoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [role, setRole] = useState('ROLE_STUDENT');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          fullName,
          rollNumber,
          department,
          role,
        });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (roleType) => {
    setError('');
    setLoading(true);
    try {
      await quickDemoLogin(roleType);
    } catch (err) {
      setError('Demo login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100">
      
      {/* Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {isRegister ? 'Create your AttendEase Account' : 'Sign in to AttendEase'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Industry-grade Smart Attendance with 10s Dynamic QR & Geofence Anti-Proxy
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10">

          {/* Quick Demo Login Presets Banner */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50/50 border border-brand-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Instant 1-Click Demo Evaluation
              </span>
              <span className="text-[10px] text-brand-600 font-medium bg-brand-100/60 px-2 py-0.5 rounded-full">
                No typing required
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('FACULTY')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold bg-white text-brand-700 border border-brand-200 shadow-sm hover:bg-brand-50 hover:border-brand-300 transition-all disabled:opacity-50"
              >
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Dr. Sharma (Faculty)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('STUDENT1')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold bg-white text-emerald-700 border border-emerald-200 shadow-sm hover:bg-emerald-50 hover:border-emerald-300 transition-all disabled:opacity-50"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alex Morgan (Student)</span>
              </button>
            </div>
          </div>

          {/* Error notification */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Switch Tab between Sign In / Sign Up */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                !isRegister
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                isRegister
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              New Registration
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* If Register: Full Name & Role */}
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Johnathan Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Role *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white font-medium"
                    >
                      <option value="ROLE_STUDENT">Student</option>
                      <option value="ROLE_FACULTY">Faculty / Instructor</option>
                      <option value="ROLE_ADMIN">System Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {role === 'ROLE_STUDENT' ? 'Roll Number' : 'Employee ID'}
                    </label>
                    <input
                      type="text"
                      placeholder={role === 'ROLE_STUDENT' ? 'e.g. CS2026-099' : 'e.g. FAC-2004'}
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                  />
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@attendease.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : isRegister ? 'Complete Registration' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Bottom Security Credentials Summary */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 text-center">
              Anti-Proxy Multi-Layer Protection
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center space-x-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <QrCode className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span>10s Dynamic QR Rotation</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Haversine GPS Geofence</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span>Device Fingerprint Lock</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>PDF, DOCX & Excel Exports</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
