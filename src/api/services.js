import api from './client';

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Projects
export const projectsAPI = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  members: (id) => api.get(`/projects/${id}/members`),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { user_id: userId }),
};

// Tasks
export const tasksAPI = {
  listByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  get: (id) => api.get(`/tasks/${id}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  myTasks: () => api.get('/tasks/my-tasks'),
};

// Users
export const usersAPI = {
  list: () => api.get('/users'),
};
