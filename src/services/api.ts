import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Account-ID': '2'  // Hardcoded for now
  }
});

export const groupsApi = {
  list: () => api.get('/groups'),
  create: (data: any) => api.post('/groups', data),
  update: (id: string, data: any) => api.patch(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`)
};

export const modulesApi = {
  list: (groupId: string) => api.get('/modules', { headers: { 'Group-ID': groupId } }),
  create: (groupId: string, data: any) => 
    api.post('/modules', data, { headers: { 'Group-ID': groupId } }),
  update: (id: string, data: any) => 
    api.patch(`/modules/${id}`, data),
  updateCode: (id: string, code: string) => 
    api.patch(`/modules/${id}/code`, { code }),
  updateConfig: (id: string, config: any) => 
    api.patch(`/modules/${id}/user-config`, { user_config: config }),
  run: (id: string) => 
    api.post(`/modules/${id}/run`),
  delete: (id: string) => 
    api.delete(`/modules/${id}`)
};

export const canvasApi = {
  list: () => api.get('/canvas'),
  create: (data: any) => api.post('/canvas', data),
  update: (id: string, data: any) => api.patch(`/canvas/${id}`, data),
  updateConfig: (id: string, config: any) => 
    api.patch(`/canvas/${id}/module-config`, { module_config: config }),
  run: (id: string) => api.post(`/canvas/${id}/run`),
  delete: (id: string) => api.delete(`/canvas/${id}`)
};

export const runsApi = {
  list: (canvasId?: string, moduleId?: string) => {
    const params = new URLSearchParams();
    if (canvasId) params.append('canvas_id', canvasId);
    if (moduleId) params.append('module_id', moduleId);
    return api.get(`/runs?${params.toString()}`);
  },
  get: (id: string) => api.get(`/runs/${id}`),
  getStatus: (id: string) => api.get(`/runs/${id}/status`),
  cancel: (id: string) => api.post(`/runs/${id}/cancel`)
};

export default {
  groups: groupsApi,
  modules: modulesApi,
  canvas: canvasApi,
  runs: runsApi
}; 