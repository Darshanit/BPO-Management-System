import api from './api';

/**
 * Builds a standard set of REST calls for a resource, e.g.:
 *   const employeeService = createCrudService('/employees');
 *   employeeService.list({ page: 1, search: 'john' })
 *   employeeService.getById(id)
 *   employeeService.create(payload)
 *   employeeService.update(id, payload)
 *   employeeService.remove(id)
 */
export const createCrudService = (basePath) => ({
  list: (params = {}) => api.get(basePath, { params }),
  getById: (id) => api.get(`${basePath}/${id}`),
  create: (payload) => api.post(basePath, payload),
  update: (id, payload) => api.put(`${basePath}/${id}`, payload),
  remove: (id) => api.delete(`${basePath}/${id}`),
});
