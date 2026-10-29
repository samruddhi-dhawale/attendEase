import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';

export default function StudentHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await attendanceApi.getMyHistory();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Compute stats
  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const verifiedCount = presentCount + lateCount;
  const percentage = totalRecords > 0 ? Math.round((verifiedCount / totalRecords) * 100) : 100;

  // Filtered records
  const filtered = records.filter((r) => {
    const matchesSearch =
      r.session?.course?.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.session?.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.session?.sessionTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner / Student ID Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Student Attendance Dossier
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
              {user?.rollNumber || 'CS2026-042'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {user?.fullName} • {user?.department || 'Computer Science & Engineering'}
          </p>
        </div>

        <button
          onClick={fetchRecords}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Overall Percentage Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Overall Attendance</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 block">
              {percentage}%
            </span>
            <span className={`text-[11px] font-semibold mt-1 inline-flex items-center space-x-1 ${
              percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {percentage >= 75 ? '✓ Exam Eligible (>75%)' : '⚠ Below 75% Threshold'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sessions Attended */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Sessions Recorded</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 block">
              {totalRecords}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">All registered subjects</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Present (On Time) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">On-Time Check-Ins</span>
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight mt-1 block">
              {presentCount}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              Punctuality Rate: {totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Late or Flagged */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Late Admissions</span>
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight mt-1 block">
              {lateCount}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Post grace period check-in</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course code or lecture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="PROXY_BLOCKED">Proxy Blocked</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Lecture / Session</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Venue & Distance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    No attendance records match your current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">
                        {r.session?.course?.courseCode}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {r.session?.course?.title}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {r.session?.sessionTitle}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.session?.sessionDate}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500 text-[11px] mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.checkInTime?.substring(11, 16)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {r.session?.venueName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span>
                          {r.distanceFromVenueMeters != null
                            ? `${r.distanceFromVenueMeters.toFixed(1)}m away`
                            : 'Within boundary'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'LATE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-slate-700 font-semibold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{r.verificationStatus}</span>
                      </div>
                      {r.remarks && (
                        <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                          {r.remarks}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
