import axios from 'axios';

// allow overriding via environment variable (Vite prefixes with VITE_)
const API_BASE = import.meta.env.VITE_API_BASE || 'https://quicktest-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// log errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API error:', err.response?.status, err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (username, password, adminSecret) =>
    api.post('/register', { username, password, adminSecret }),
  login: (username, password) => api.post('/login', { username, password }),
  forgotPassword: (username) => api.post('/forgot-password', { username }),
  resetPassword: (token, newPassword) => api.post('/reset-password', { token, newPassword }),
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function uploadWithRetry(endpoint, file, retries = 1) {
  const data = new FormData();
  data.append('file', file);

  try {
    return await api.post(endpoint, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    });
  } catch (err) {
    const status = err?.response?.status;
    const isTransient = !status || status >= 500 || status === 408 || status === 429;
    if (retries > 0 && isTransient) {
      await sleep(1500);
      return uploadWithRetry(endpoint, file, retries - 1);
    }
    throw err;
  }
}

export const quizAPI = {
  getQuestions: (course, topic, difficulty, count) => {
    const params = {};
    if (course) params.course = course;
    // backend treats any non-empty topic as filter, so ignore the 'All Topics' sentinel
    if (topic && topic !== 'All Topics') params.topic = topic;
    if (difficulty && difficulty !== 'All Levels') params.difficulty = difficulty.toLowerCase();
    if (count) params.limit = count;
    return api.get('/questions', { params });
  },
  getMetadata: () => api.get('/metadata'),
  submitAnswers: (answers) => api.post('/submit', { answers }),
  getMyAttempts: () => api.get('/my-attempts'),
  getLeaderboard: () => api.get('/leaderboard'),
  uploadPDF: (file) => uploadWithRetry('/upload-pdf', file, 1),
  getMyUploads: () => api.get('/my-uploads'),
};

export const adminAPI = {
  importQuestions: (questions) => api.post('/import', { questions }),
  getStats: () => api.get('/admin/stats'),
  getUploadedPDFs: () => api.get('/admin/uploads'),
  uploadPDF: (file) => uploadWithRetry('/upload-pdf', file, 1),
  deleteUploadedPDF: (id) => api.delete(`/admin/uploads/${id}`),
};

export default api;
