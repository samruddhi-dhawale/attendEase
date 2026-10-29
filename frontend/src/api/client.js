import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('attendease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Token expired or invalid
      localStorage.removeItem('attendease_token');
      localStorage.removeItem('attendease_user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials).then((res) => res.data),
  register: (data) => api.post('/auth/register', data).then((res) => res.data),
  getCurrentUser: () => api.get('/auth/me').then((res) => res.data),
};

export const courseApi = {
  getAll: () => api.get('/courses').then((res) => res.data),
  create: (course) => api.post('/courses', course).then((res) => res.data),
};

export const sessionApi = {
  getAll: (activeOnly = false) =>
    api.get(`/sessions${activeOnly ? '?activeOnly=true' : ''}`).then((res) => res.data),
  getById: (id) => api.get(`/sessions/${id}`).then((res) => res.data),
  create: (data) => api.post('/sessions', data).then((res) => res.data),
  toggleStatus: (id, active) => api.patch(`/sessions/${id}/status`, { active }).then((res) => res.data),
  getLiveQr: (id) => api.get(`/sessions/${id}/live-qr`).then((res) => res.data),
};

export const attendanceApi = {
  checkIn: (data) => api.post('/attendance/check-in', data).then((res) => res.data),
  getSessionRecords: (sessionId) => api.get(`/attendance/session/${sessionId}`).then((res) => res.data),
  getMyHistory: () => api.get('/attendance/my-history').then((res) => res.data),
  overrideRecord: (recordId, status, remarks) =>
    api.patch(`/attendance/${recordId}/override`, { status, remarks }).then((res) => res.data),
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard').then((res) => res.data),
};

export const exportApi = {
  downloadPdf: (sessionId) => downloadFile(`/api/export/pdf/${sessionId}`, `attendance-session-${sessionId}.pdf`),
  downloadWord: (sessionId) => downloadFile(`/api/export/word/${sessionId}`, `attendance-session-${sessionId}.docx`),
  downloadExcel: (sessionId) => downloadFile(`/api/export/excel/${sessionId}`, `attendance-session-${sessionId}.xlsx`),
  downloadCsv: (sessionId) => downloadFile(`/api/export/csv/${sessionId}`, `attendance-session-${sessionId}.csv`),
};

async function downloadFile(url, fallbackFilename) {
  const token = localStorage.getItem('attendease_token');
  const response = await fetch(`${url}?token=${token || ''}`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Export download failed');
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fallbackFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export default api;
