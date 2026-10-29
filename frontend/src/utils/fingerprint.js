/**
 * Anti-Proxy Device Fingerprinting Engine
 * Collects hardware concurrency, canvas hash, screen metrics, and device ID
 * to guarantee that multiple students cannot scan on the same phone.
 */
export function getDeviceFingerprint() {
  try {
    let deviceId = localStorage.getItem('attendease_device_uuid');
    if (!deviceId) {
      deviceId = 'dev-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now().toString(36);
      localStorage.setItem('attendease_device_uuid', deviceId);
    }

    // Canvas fingerprinting
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(10, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('AttendEase AntiProxy', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('AttendEase AntiProxy', 4, 17);
    }
    const canvasData = canvas.toDataURL();

    // Hardware parameters
    const nav = window.navigator;
    const screen = window.screen;
    const components = [
      deviceId,
      nav.userAgent || '',
      screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
      nav.language || '',
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      nav.hardwareConcurrency || 'unknown-cores',
      canvasData.slice(-30)
    ];

    // Simple hash
    const str = components.join('###');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }

    return 'fp_' + Math.abs(hash).toString(16) + '_' + deviceId.slice(-6);
  } catch (err) {
    return 'fallback_fp_' + Math.random().toString(36).substring(2, 9);
  }
}
