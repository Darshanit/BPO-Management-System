import api from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  sendOtp: (email) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),
};
