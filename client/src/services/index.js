import api from './api';
import { createCrudService } from './createCrudService';

export const userService = {
  ...createCrudService('/users'),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  activate: (id) => api.patch(`/users/${id}/activate`),
};

export const employeeService = {
  ...createCrudService('/employees'),
  getMyProfile: () => api.get('/employees/me/profile'),
  addPerformanceReview: (id, payload) => api.post(`/employees/${id}/performance`, payload),
};

export const departmentService = createCrudService('/departments');

export const attendanceService = {
  clockIn: () => api.post('/attendance/clock-in'),
  clockOut: () => api.post('/attendance/clock-out'),
  startBreak: () => api.post('/attendance/break/start'),
  endBreak: () => api.post('/attendance/break/end'),
  getMine: (params) => api.get('/attendance/me', { params }),
  getAll: (params) => api.get('/attendance', { params }),
  getMonthlySummary: (employeeId, params) =>
    api.get(`/attendance/summary/${employeeId}`, { params }),
};

export const leaveService = {
  apply: (payload) => api.post('/leaves/apply', payload),
  getMine: () => api.get('/leaves/me'),
  getAll: (params) => api.get('/leaves', { params }),
  approve: (id) => api.patch(`/leaves/${id}/approve`),
  reject: (id, rejectionReason) => api.patch(`/leaves/${id}/reject`, { rejectionReason }),
  cancel: (id) => api.patch(`/leaves/${id}/cancel`),
};

export const payrollService = {
  getAll: (params) => api.get('/payroll', { params }),
  getMine: () => api.get('/payroll/me'),
  generate: (payload) => api.post('/payroll/generate', payload),
  markAsPaid: (id) => api.patch(`/payroll/${id}/mark-paid`),
};

export const projectService = {
  ...createCrudService('/projects'),
  getMyClientProjects: () => api.get('/projects/client/mine'),
  addMilestone: (id, payload) => api.post(`/projects/${id}/milestones`, payload),
  completeMilestone: (id, milestoneId) =>
    api.patch(`/projects/${id}/milestones/${milestoneId}/complete`),
};

export const taskService = {
  getByProject: (projectId) => api.get('/tasks', { params: { project: projectId } }),
  getById: (id) => api.get(`/tasks/${id}`),
  getMine: () => api.get('/tasks/my'),
  create: (payload) => api.post('/tasks', payload),
  update: (id, payload) => api.put(`/tasks/${id}`, payload),
  move: (id, payload) => api.patch(`/tasks/${id}/move`, payload),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export const teamService = {
  ...createCrudService('/teams'),
  getMine: () => api.get('/teams/mine'),
};

export const clientService = {
  ...createCrudService('/clients'),
  getMyProfile: () => api.get('/clients/me'),
  addInvoice: (id, payload) => api.post(`/clients/${id}/invoices`, payload),
  raiseTicket: (payload) => api.post('/clients/tickets', payload),
  getMyTickets: () => api.get('/clients/tickets/mine'),
  getAllTickets: (params) => api.get('/clients/tickets', { params }),
  replyToTicket: (id, payload) => api.patch(`/clients/tickets/${id}/reply`, payload),
};

export const chatService = {
  getMyChats: () => api.get('/chat'),
  getOrCreatePrivateChat: (userId) => api.post('/chat/private', { userId }),
  createTeamChat: (payload) => api.post('/chat/team', payload),
  getMessages: (chatId, params) => api.get(`/chat/${chatId}/messages`, { params }),
  sendMessage: (chatId, payload) => api.post(`/chat/${chatId}/messages`, payload),
};

export const notificationService = {
  getMine: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  remove: (id) => api.delete(`/notifications/${id}`),
};

export const reportService = {
  download: (type, params) =>
    api.get(`/reports/${type}`, { params, responseType: 'blob' }),
};

export const settingsService = {
  get: () => api.get('/settings'),
  update: (payload) => api.put('/settings', payload),
};

export const recruitmentService = {
  getCandidates: (params) => api.get('/recruitment', { params }),
  getById: (id) => api.get(`/recruitment/${id}`),
  create: (payload) => api.post('/recruitment', payload),
  update: (id, payload) => api.put(`/recruitment/${id}`, payload),
  moveStage: (id, status) => api.patch(`/recruitment/${id}/stage`, { status }),
  addNote: (id, text) => api.post(`/recruitment/${id}/notes`, { text }),
  remove: (id) => api.delete(`/recruitment/${id}`),
};

export const documentService = {
  upload: (formData) =>
    api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getForEntity: (relatedKind, relatedId) => api.get(`/documents/${relatedKind}/${relatedId}`),
  remove: (id) => api.delete(`/documents/${id}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};
