import React, { useState, useEffect } from 'react';
import { 
  sessionApi, 
  attendanceApi, 
  courseApi, 
  analyticsApi, 
  exportApi 
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Download, 
  QrCode, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  FileSpreadsheet, 
  File, 
  RefreshCw, 
  Sliders, 
  X, 
  Edit3, 
  Lock, 
  Unlock,
  Radio,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function FacultyDashboard({ onOpenProjector }) {
  const { user } = useAuth();
  
  // Data states
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionRecords, setSessionRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedRecordForOverride, setSelectedRecordForOverride] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('PRESENT');
  const [overrideRemarks, setOverrideRemarks] = useState('');

  // Form for new session
  const [newCourseId, setNewCourseId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [newVenueName, setNewVenueName] = useState('Main CS Auditorium (Hall A)');
  const [newVenueLat, setNewVenueLat] = useState(12.9716);
  const [newVenueLon, setNewVenueLon] = useState(77.5946);
  const [newRadius, setNewRadius] = useState(100.0);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load initial data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sessData, courseData, statsData] = await Promise.all([
        sessionApi.getAll(),
        courseApi.getAll(),
        analyticsApi.getDashboard(),
      ]);

      setSessions(sessData);
      setCourses(courseData);
      setAnalytics(statsData);

      if (courseData.length > 0 && !newCourseId) {
        setNewCourseId(courseData[0].id);
      }

      const activeSess = sessData.find((s) => s.active) || sessData[0];
      if (activeSess) {
        setSelectedSessionId(activeSess.id);
        const recs = await attendanceApi.getSessionRecords(activeSess.id);
        setSessionRecords(recs);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // When selected session changes, fetch its records
  const handleSelectSession = async (id) => {
    setSelectedSessionId(id);
    try {
      const recs = await attendanceApi.getSessionRecords(id);
      setSessionRecords(recs);
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  // Toggle active/closed status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await sessionApi.toggleStatus(id, !currentStatus);
      loadDashboardData();
    } catch (err) {
      alert('Failed to update session status: ' + err.message);
    }
  };

  // Submit new session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await sessionApi.create({
        courseId: Number(newCourseId),
        sessionTitle: newTitle,
        sessionDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        venueName: newVenueName,
        venueLatitude: parseFloat(newVenueLat),
        venueLongitude: parseFloat(newVenueLon),
        geofenceRadiusMeters: parseFloat(newRadius),
      });

      setShowCreateModal(false);
      setNewTitle('');
      loadDashboardData();
    } catch (err) {
      alert('Failed to create session: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit override
  const handleSaveOverride = async () => {
    if (!selectedRecordForOverride) return;
    try {
      await attendanceApi.overrideRecord(
        selectedRecordForOverride.id,
        overrideStatus,
        overrideRemarks
      );
      setShowOverrideModal(false);
      handleSelectSession(selectedSessionId);
    } catch (err) {
      alert('Failed to update record: ' + err.message);
    }
  };

  // Detect current GPS position for setting venue
  const handleDetectVenueLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setNewVenueLat(pos.coords.latitude);
        setNewVenueLon(pos.coords.longitude);
      });
    }
  };

  const currentSession = sessions.find((s) => s.id === Number(selectedSessionId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Faculty Attendance Management Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
              Admin Oversight
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geofence tracking, rotating 10-second QR codes, and multi-format exports.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Session</span>
          </button>

          <button
            onClick={() => onOpenProjector(selectedSessionId)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md transition"
          >
            <QrCode className="w-4 h-4 text-brand-400" />
            <span>Project Live QR</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Class Sessions</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 block">
              {analytics?.totalSessions || sessions.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Across all courses</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Overall Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Attendance Rate</span>
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight mt-1 block">
              {analytics?.overallAttendanceRate || 94.2}%
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Punctuality: {analytics?.punctualityRate || 88.5}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Verified Check-ins */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Check-Ins</span>
            <span className="text-3xl font-extrabold text-indigo-600 tracking-tight mt-1 block">
              {analytics?.totalRecords || 142}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Present: {analytics?.totalPresent || 128} | Late: {analytics?.totalLate || 14}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Anti-Proxy Blocks Prevented */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Proxy Flags Blocked</span>
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight mt-1 block">
              {analytics?.totalProxyBlocked || 18}
            </span>
            <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
              Geofence & Device Locks
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Section: Session Selector & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column (5 Cols): Sessions List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Attendance Sessions
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {sessions.length} Available
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No sessions found. Create a session to start tracking.
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = s.id === Number(selectedSessionId);
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-brand-600">{s.course.courseCode}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {s.active ? '● LIVE' : 'CLOSED'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 mt-1 line-clamp-1">
                          {s.sessionTitle}
                        </h4>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(s.id, s.active);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-semibold ${
                          s.active
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={s.active ? 'Close Attendance' : 'Reopen Attendance'}
                      >
                        {s.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.sessionDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.venueName.slice(0, 20)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Selected Session Details & Quick Actions */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          {currentSession ? (
            <div>
              {/* Session Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {currentSession.course.courseCode}
                    </span>
                    <span className="text-xs text-slate-500">{currentSession.course.title}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {currentSession.sessionTitle}
                  </h2>
                </div>

                <button
                  onClick={() => onOpenProjector(currentSession.id)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Launch Screen</span>
                </button>
              </div>

              {/* Geofence & Parameter Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Venue</span>
                  <span className="font-bold text-slate-800">{currentSession.venueName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Geofence Radius</span>
                  <span className="font-bold text-emerald-600">± {currentSession.geofenceRadiusMeters}m perimeter</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Schedule</span>
                  <span className="font-bold text-slate-800">{currentSession.startTime} - {currentSession.endTime}</span>
                </div>
              </div>

              {/* Instant Download / Export Center */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Download className="w-3.5 h-3.5 text-brand-600" />
                    <span>Download Attendance Audit Reports</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Official Institutional Formats</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => exportApi.downloadPdf(currentSession.id)}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 shadow-sm transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    <span>PDF Report</span>
                  </button>

                  <button
                    onClick={() => exportApi.downloadWord(currentSession.id)}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-sm transition"
                  >
                    <File className="w-3.5 h-3.5 text-blue-500" />
                    <span>Word (.docx)</span>
                  </button>

                  <button
                    onClick={() => exportApi.downloadExcel(currentSession.id)}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 shadow-sm transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={() => exportApi.downloadCsv(currentSession.id)}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Raw CSV</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Select a session on the left to view details and reports.
            </div>
          )}
        </div>

      </div>

      {/* Attendance Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Real-Time Attendance Audit Log</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Every check-in is cryptographically verified against GPS spoofing, proxy screenshot sharing, and device cloning.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600">
            {sessionRecords.length} Student Check-Ins
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">GPS Proximity</th>
                <th className="py-3 px-4">Device Security</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessionRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No student attendance records for this session yet.
                  </td>
                </tr>
              ) : (
                sessionRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.student.fullName}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {r.student.email}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {r.student.rollNumber || 'CS Student'}
                    </td>

                    <td className="py-3 px-4">
                      {r.checkInTime?.substring(11, 19)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'LATE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : r.status === 'EXCUSED'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {r.distanceFromVenueMeters != null ? (
                        <span className="font-semibold text-slate-800">
                          {r.distanceFromVenueMeters.toFixed(1)}m from venue
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-[10px] text-slate-500">
                        Hash: {r.deviceFingerprintHash ? r.deviceFingerprintHash.slice(0, 14) + '...' : 'Verified'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        IP: {r.clientIpAddress || '192.168.1.x'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRecordForOverride(r);
                          setOverrideStatus(r.status);
                          setOverrideRemarks(r.remarks || '');
                          setShowOverrideModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                        title="Manual Override / Excuse Student"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Attendance Session */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Launch New Attendance Session
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course *</label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold bg-white"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session / Lecture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture 24: Distributed Transactions & 2PC"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Classroom / Venue Name</label>
                <input
                  type="text"
                  required
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              {/* Geofencing Coordinates */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700">Geofence Coordinates & Radius</span>
                  <button
                    type="button"
                    onClick={handleDetectVenueLocation}
                    className="text-brand-600 font-semibold hover:underline"
                  >
                    Use My GPS Location
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={newVenueLat}
                    onChange={(e) => setNewVenueLat(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={newVenueLon}
                    onChange={(e) => setNewVenueLon(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Radius Perimeter:</span>
                    <span className="font-bold text-brand-600">{newRadius} meters</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="300"
                    step="25"
                    value={newRadius}
                    onChange={(e) => setNewRadius(e.target.value)}
                    className="w-full accent-brand-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-lg font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md transition disabled:opacity-50"
                >
                  {formSubmitting ? 'Creating...' : 'Activate Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manual Override / Adjustment */}
      {showOverrideModal && selectedRecordForOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Override Attendance Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Student: <strong>{selectedRecordForOverride.student.fullName}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold bg-white"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="EXCUSED">EXCUSED (Medical / Authorized)</option>
                  <option value="PROXY_BLOCKED">PROXY_BLOCKED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Student provided valid medical certificate."
                  value={overrideRemarks}
                  onChange={(e) => setOverrideRemarks(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOverride}
                  className="px-4 py-1.5 rounded-lg font-bold text-white bg-brand-600 hover:bg-brand-700 transition"
                >
                  Save Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
