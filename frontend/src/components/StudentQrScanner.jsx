import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { attendanceApi, sessionApi } from '../api/client';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { 
  Camera, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  RotateCw, 
  RefreshCw, 
  Smartphone,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function StudentQrScanner({ onAttendanceSuccess }) {
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  
  // Geolocation state
  const [coords, setCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [gpsError, setGpsError] = useState(null);

  // Scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Fallback manual test token input
  const [manualToken, setManualToken] = useState('');

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'qr-reader-viewport';

  // Fetch active sessions
  useEffect(() => {
    sessionApi.getAll(true).then((data) => {
      setActiveSessions(data);
      if (data.length > 0) {
        setSelectedSessionId(data[0].id);
      }
    });
  }, []);

  // Request browser geolocation
  const requestLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGpsLoading(false);
      },
      (error) => {
        // Fallback for desktop simulators or blocked permissions:
        // Use default campus venue coordinates if user accepts demo fallback
        console.warn('GPS permission denied or unavailable:', error.message);
        setGpsError('GPS access denied. Click "Simulate Classroom Location" for local demo.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Provide a quick button to set coordinates near the venue for testing on desktop
  const simulateVenueLocation = () => {
    const session = activeSessions.find((s) => s.id === Number(selectedSessionId));
    if (session) {
      setCoords({
        latitude: session.venueLatitude + 0.00005, // ~5 meters away
        longitude: session.venueLongitude + 0.00005,
        accuracy: 5.0,
      });
      setGpsError(null);
    } else {
      setCoords({ latitude: 12.97162, longitude: 77.59462, accuracy: 4.0 });
      setGpsError(null);
    }
  };

  // Start HTML5 camera scanner
  const startCamera = async () => {
    setScannerError('');
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScannedData(decodedText);
          stopCamera();
        },
        (errorMessage) => {
          // scanning frame - ignore non-matching frames
        }
      );
      setCameraActive(true);
    } catch (err) {
      setScannerError('Camera permission denied or camera not found on this device.');
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    } finally {
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Parse QR content and submit attendance
  const handleScannedData = async (rawQrString) => {
    // Expected format: ATTENDEASE:sessionId:timeSlot:signature
    let parsedSessionId = selectedSessionId;
    let tokenPayload = rawQrString;

    if (rawQrString.startsWith('ATTENDEASE:')) {
      const parts = rawQrString.substring(11).split(':');
      if (parts.length >= 3) {
        parsedSessionId = Number(parts[0]);
        tokenPayload = parts.join(':');
      }
    }

    await submitCheckIn(parsedSessionId, tokenPayload);
  };

  // Submit attendance with GPS, Token, and Device Fingerprint
  const submitCheckIn = async (sessionId, qrToken) => {
    if (!sessionId) {
      setScannerError('Please select a valid active session.');
      return;
    }

    if (!coords) {
      setScannerError('Location required! Please allow GPS access or click "Simulate Location".');
      return;
    }

    setSubmitting(true);
    setScannerError('');
    setResult(null);

    try {
      const fingerprint = getDeviceFingerprint();

      const response = await attendanceApi.checkIn({
        sessionId: Number(sessionId),
        qrToken: qrToken.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy || 10.0,
        deviceFingerprint: fingerprint,
      });

      setResult(response);

      if (response.success) {
        // Trigger celebration confetti!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });

        if (onAttendanceSuccess) {
          onAttendanceSuccess(response);
        }
      }
    } catch (err) {
      setScannerError(
        err.response?.data?.message || err.message || 'Verification failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // File upload QR reader fallback
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const scanner = new Html5Qrcode('qr-reader-temp');
      const decodedText = await scanner.scanFile(file, true);
      handleScannedData(decodedText);
    } catch (err) {
      setScannerError('Could not decode QR code from the uploaded image. Please ensure the QR is clear.');
    }
  };

  // Fast demo test: Auto-pull latest dynamic token directly from server
  const handleQuickSimulateScan = async () => {
    if (!selectedSessionId) return;
    try {
      setSubmitting(true);
      const liveData = await sessionApi.getLiveQr(selectedSessionId);
      simulateVenueLocation();
      // Short delay to let coords update
      setTimeout(() => {
        submitCheckIn(selectedSessionId, liveData.qrPayload.replace('ATTENDEASE:', ''));
      }, 300);
    } catch (err) {
      setScannerError('Failed to fetch live session token: ' + err.message);
      setSubmitting(false);
    }
  };

  const selectedSession = activeSessions.find((s) => s.id === Number(selectedSessionId));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Hidden container for temp file scanning */}
      <div id="qr-reader-temp" style={{ display: 'none' }}></div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-3 shadow-sm">
          <Camera className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Smart Attendance Scanner
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Scan the 10-second dynamic QR code displayed on the classroom screen.
        </p>
      </div>

      {/* Verification Result Card (Success or Proxy Alert) */}
      {result && (
        <div
          className={`mb-6 p-6 rounded-2xl border shadow-lg transition-all ${
            result.success
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 shadow-emerald-500/10'
              : 'bg-rose-50/80 border-rose-200 text-rose-900 shadow-rose-500/10'
          }`}
        >
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-7 h-7 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">
                  {result.success ? 'Attendance Verified!' : 'Verification Flagged'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    result.status === 'PRESENT'
                      ? 'bg-emerald-600 text-white'
                      : result.status === 'LATE'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {result.status}
                </span>
              </div>

              <p className="text-sm mt-1 text-slate-700">{result.message}</p>

              <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Session</span>
                  <span className="font-semibold">{result.courseCode || 'CS401'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Distance to Venue</span>
                  <span className="font-semibold">
                    {result.distanceMeters != null ? `${result.distanceMeters.toFixed(1)} meters` : 'Verified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Audit Status</span>
                  <span className="font-semibold">{result.verificationStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Error */}
      {scannerError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Anti-Proxy System Check Failed</p>
            <p className="text-xs text-rose-600 mt-0.5">{scannerError}</p>
          </div>
        </div>
      )}

      {/* Main Scanner Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        
        {/* Step 1: Session Selector & GPS Telemetry */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Active Session Dropdown */}
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Current Class
            </label>
            {activeSessions.length > 0 ? (
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              >
                {activeSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.course.courseCode}: {s.sessionTitle} ({s.venueName})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                No active attendance sessions currently open.
              </div>
            )}
          </div>

          {/* GPS Status Indicator */}
          <div className="sm:text-right">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              GPS Geofence Status
            </span>
            {gpsLoading ? (
              <span className="inline-flex items-center space-x-1.5 text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Locating GPS...</span>
              </span>
            ) : coords ? (
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>GPS Locked (±{coords.accuracy ? coords.accuracy.toFixed(0) : '5'}m)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={simulateVenueLocation}
                className="inline-flex items-center space-x-1 text-xs text-brand-600 font-semibold hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>Simulate Classroom GPS</span>
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Camera Viewport / Scanning Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-900 text-white min-h-[340px] relative">
          
          <div
            id={scannerContainerId}
            className={`w-full max-w-sm rounded-xl overflow-hidden ${
              cameraActive ? 'block' : 'hidden'
            }`}
          />

          {!cameraActive && (
            <div className="text-center py-8 px-4 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400">
                  <Camera className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </div>
              </div>

              <h4 className="text-base font-bold text-white mb-1">
                Camera Viewfinder Inactive
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mb-5">
                Point your camera directly at the teacher's projector screen to scan the 10-second expiring QR code.
              </p>

              <button
                type="button"
                onClick={startCamera}
                className="flex items-center space-x-2 py-2.5 px-6 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Open Scanner Camera</span>
              </button>
            </div>
          )}

          {cameraActive && (
            <button
              type="button"
              onClick={stopCamera}
              className="mt-4 px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Close Camera
            </button>
          )}
        </div>

        {/* Step 3: Fast Desktop Testing Options (File Upload & Quick Check-in Simulator) */}
        <div className="p-5 bg-white border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Desktop / Simulator Testing Options
            </span>
            <span className="text-[11px] text-slate-400">
              For testing without mobile camera
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Quick 1-Click Scan from Classroom Screen */}
            <button
              type="button"
              onClick={handleQuickSimulateScan}
              disabled={submitting || activeSessions.length === 0}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-brand-200 bg-brand-50/50 hover:bg-brand-50 text-brand-700 text-xs font-bold transition disabled:opacity-50"
            >
              <Smartphone className="w-4 h-4 text-brand-600" />
              <span>{submitting ? 'Verifying...' : '1-Click Scan Live Classroom QR'}</span>
            </button>

            {/* Upload QR screenshot */}
            <label className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Upload QR Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Security Info Card */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-800 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Anti-Proxy Rules Enforced on Every Scan</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
          <li><strong>10-Second Expiry:</strong> Screenshot sharing over chat will fail verification.</li>
          <li><strong>Venue Geofencing:</strong> Haversine distance must be within classroom radius.</li>
          <li><strong>Device Fingerprint:</strong> A physical phone can only mark attendance once per session.</li>
        </ul>
      </div>

    </div>
  );
}
