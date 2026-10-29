import React, { useState, useEffect, useRef } from 'react';
import { sessionApi, attendanceApi } from '../api/client';
import { 
  QrCode, 
  Clock, 
  MapPin, 
  Users, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Layers
} from 'lucide-react';

export default function LiveQrProjector({ initialSessionId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [attendees, setAttendees] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const containerRef = useRef(null);

  // Play subtle sound using Web Audio API on code refresh
  const playRefreshChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio context might require user interaction
    }
  };

  // Fetch all active sessions
  useEffect(() => {
    sessionApi.getAll(true).then((data) => {
      setSessions(data);
      if (data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id);
      }
    });
  }, []);

  // Fetch live QR data
  const fetchQr = async () => {
    if (!selectedSessionId) return;
    try {
      const data = await sessionApi.getLiveQr(selectedSessionId);
      setQrData(data);
      setCountdown(data.expiresInSeconds || 10);
      playRefreshChime();
    } catch (err) {
      console.error('Failed to load dynamic QR:', err);
    }
  };

  // Poll recent attendees
  const fetchAttendees = async () => {
    if (!selectedSessionId) return;
    try {
      const recs = await attendanceApi.getSessionRecords(selectedSessionId);
      setAttendees(recs);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
    }
  };

  useEffect(() => {
    if (selectedSessionId) {
      fetchQr();
      fetchAttendees();
    }
  }, [selectedSessionId]);

  // Dynamic 1-second countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchQr();
          fetchAttendees();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSessionId, soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const selectedSession = sessions.find((s) => s.id === Number(selectedSessionId));

  // Progress ring percentage calculation
  const strokeDashoffset = 283 - (283 * countdown) / 10;

  return (
    <div
      ref={containerRef}
      className={`min-h-[calc(100vh-4rem)] bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-8 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 p-8 sm:p-12 overflow-y-auto' : ''
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <QrCode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Live Classroom Attendance Projector
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Rotating HMAC-SHA256
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tokens strictly expire after 10 seconds. Anti-screenshot & location validated.
            </p>
          </div>
        </div>

        {/* Controls: Session dropdown, sound, fullscreen */}
        <div className="flex items-center space-x-3">
          {sessions.length > 0 && (
            <select
              value={selectedSessionId || ''}
              onChange={(e) => setSelectedSessionId(Number(e.target.value))}
              className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-3 py-2 outline-none font-medium focus:ring-2 focus:ring-brand-500"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.course.courseCode}: {s.sessionTitle.slice(0, 32)}...
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={soundEnabled ? 'Mute Refresh Sound' : 'Enable Refresh Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Toggle Projector Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Stage: QR Code & Real-Time Security Metrics */}
      <div className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full">
        
        {/* Left Column: Live QR Code & Countdown Timer */}
        <div className="lg:col-span-7 flex flex-col items-center text-center">
          
          {/* Active Course Card */}
          {selectedSession && (
            <div className="mb-4 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <span className="font-bold text-brand-400">{selectedSession.course.courseCode}</span>
              <span>•</span>
              <span className="truncate max-w-[280px]">{selectedSession.course.title}</span>
            </div>
          )}

          <div className="relative group p-6 bg-white rounded-3xl shadow-2xl shadow-brand-500/10 border-4 border-slate-800 flex flex-col items-center justify-center">
            
            {/* Top scanning animation line */}
            <div className="absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent animate-laser pointer-events-none rounded-full" />

            {/* QR Code Image */}
            {qrData?.qrCodeDataUri ? (
              <img
                src={qrData.qrCodeDataUri}
                alt="Dynamic AttendEase Attendance QR"
                className="w-72 h-72 sm:w-80 sm:h-80 object-contain rounded-xl select-none"
              />
            ) : (
              <div className="w-72 h-72 sm:w-80 sm:h-80 flex flex-col items-center justify-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mb-2" />
                <span className="text-xs">Generating dynamic token...</span>
              </div>
            )}

            {/* Expiring Badge overlay */}
            <div className="mt-4 flex items-center space-x-3 bg-slate-900 text-white px-5 py-2 rounded-2xl border border-slate-800 shadow-md">
              
              {/* Circular SVG Countdown */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="13"
                    className="stroke-slate-700 fill-none"
                    strokeWidth="3"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="13"
                    className="stroke-brand-500 fill-none transition-all duration-1000 ease-linear"
                    strokeWidth="3"
                    strokeDasharray="81.68"
                    strokeDashoffset={81.68 - (81.68 * countdown) / 10}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-white font-mono">
                  {countdown}
                </span>
              </div>

              <div className="text-left">
                <div className="text-xs font-bold text-white tracking-wide">
                  Refreshes in {countdown}s
                </div>
                <div className="text-[10px] text-slate-400">
                  Auto-destroys forwarded screenshots
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400 max-w-md">
            Scan via the AttendEase Student App. Your GPS position must be within the auditorium perimeter.
          </p>
        </div>

        {/* Right Column: Venue Geofence & Live Attendee Stream */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Venue Geofence Telemetry Card */}
          <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-5 border border-slate-700/80 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Venue Geofence Radar</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Assigned Venue</span>
                <span className="font-semibold text-slate-200">
                  {qrData?.venueName || selectedSession?.venueName || 'Main Auditorium'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Geofence Radius</span>
                <span className="font-bold text-emerald-400">
                  ± {qrData?.geofenceRadiusMeters || selectedSession?.geofenceRadiusMeters || 100} meters
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/40 px-3 py-2 rounded-xl">
              <span>Coordinates:</span>
              <span className="font-mono text-slate-300">
                {qrData?.venueLatitude?.toFixed(4)}, {qrData?.venueLongitude?.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Live Attendee Stream */}
          <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-5 border border-slate-700/80 shadow-lg flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-400" />
                <span>Live Attendees Feed</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {attendees.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length} Verified
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {attendees.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Waiting for students to scan attendance...
                </div>
              ) : (
                attendees.slice(0, 6).map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-2 h-2 rounded-full ${
                        rec.status === 'PRESENT' ? 'bg-emerald-400' :
                        rec.status === 'LATE' ? 'bg-amber-400' : 'bg-rose-500'
                      }`} />
                      <div>
                        <div className="font-semibold text-slate-200">
                          {rec.student.fullName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {rec.student.rollNumber || 'CS Student'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : rec.status === 'LATE'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {rec.status}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {rec.distanceFromVenueMeters != null ? `${rec.distanceFromVenueMeters.toFixed(1)}m away` : 'Verified'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Footer Info */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AttendEase Anti-Proxy Architecture • One-Device-Per-Student Lock Active</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Server Hash: {qrData?.qrPayload ? qrData.qrPayload.slice(-12) : 'SYNCING'}
        </div>
      </div>
    </div>
  );
}
