import axios from 'axios';

// Types
export interface Module {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  config_schema: Record<string, any>;
  user_config: Record<string, any>;
  scope: 'global' | 'account';
  parent_module_id?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  modules: Module[];
}

export interface Canvas {
  id: string;
  name: string;
  description?: string;
  module_config: {
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: any;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type?: string;
    }>;
  };
}

export interface Run {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  started_at: string;
  completed_at?: string;
  error?: {
    message: string;
    details?: any;
  };
  results?: any;
  logs: string[];
}

// Helper function to create headers with group_id
const createHeaders = (groupId?: string) => ({
  'Content-Type': 'application/json',
  'Account-ID': '2',
  ...(groupId ? { 'Group-ID': groupId } : {})
});

const api = axios.create({
  baseURL: '/api/v1',
  headers: createHeaders()
});

// API Endpoints
export const groupsApi = {
  list: () => api.get<Group[]>('/groups'),
  
  get: (id: string) => 
    api.get<Group>(`/groups/${id}`),
  
  create: (data: { 
    name: string; 
    description?: string; 
  }) => api.post<Group>('/groups', data),
  
  update: (id: string, data: { 
    name?: string; 
    description?: string; 
  }) => api.patch<Group>(`/groups/${id}`, data),
  
  delete: (id: string) => api.delete(`/groups/${id}`)
};

export const modulesApi = {
  list: (groupId: string) => 
    api.get<Module[]>('/modules', { 
      headers: createHeaders(groupId)
    }),
  
  get: (groupId: string, id: string) => 
    api.get<Module>(`/modules/${id}`, {
      headers: createHeaders(groupId)
    }),
  
  create: (groupId: string, data: {
    name: string;
    identifier: string;
    description?: string;
    parent_module_id?: string;
    config_schema?: Record<string, any>;
    user_config?: Record<string, any>;
  }) => api.post<Module>('/modules', data, { 
    headers: createHeaders(groupId)
  }),
  
  update: (groupId: string, id: string, data: {
    name?: string;
    description?: string;
    config_schema?: Record<string, any>;
  }) => api.patch<Module>(`/modules/${id}`, data, {
    headers: createHeaders(groupId)
  }),
  
  updateCode: (groupId: string, id: string, code: string) => 
    api.patch<Module>(`/modules/${id}/code`, { code }, {
      headers: createHeaders(groupId)
    }),
  
  updateConfig: (groupId: string, id: string, config: Record<string, any>) => 
    api.patch<Module>(`/modules/${id}/user-config`, { user_config: config }, {
      headers: createHeaders(groupId)
    }),
  
  run: (groupId: string, id: string, inputs?: Record<string, any>) => 
    api.post<Run>(`/modules/${id}/run`, { inputs }, {
      headers: createHeaders(groupId)
    }),
  
  delete: (groupId: string, id: string) => 
    api.delete(`/modules/${id}`, {
      headers: createHeaders(groupId)
    })
};

export const canvasApi = {
  list: () => api.get<Canvas[]>('/canvas'),
  
  get: (id: string) => 
    api.get<Canvas>(`/canvas/${id}`),
  
  create: (data: {
    name: string;
    description?: string;
    module_config?: Canvas['module_config'];
  }) => api.post<Canvas>('/canvas', data),
  
  update: (id: string, data: {
    name?: string;
    description?: string;
    module_config?: Canvas['module_config'];
  }) => api.patch<Canvas>(`/canvas/${id}`, data),
  
  updateConfig: (id: string, config: Canvas['module_config']) => 
    api.patch<Canvas>(`/canvas/${id}/module-config`, { module_config: config }),
  
  run: (id: string) => 
    api.post<Run>(`/canvas/${id}/run`),
  
  delete: (id: string) => 
    api.delete(`/canvas/${id}`)
};

export const runsApi = {
  list: (params?: { 
    canvas_id?: string; 
    module_id?: string;
    status?: Run['status'];
    limit?: number;
    offset?: number;
  }) => api.get<Run[]>('/runs', { params }),
  
  get: (id: string) => 
    api.get<Run>(`/runs/${id}`),
  
  getStatus: (id: string) => 
    api.get<{ status: Run['status'] }>(`/runs/${id}/status`),
  
  getLogs: (id: string) => 
    api.get<string[]>(`/runs/${id}/logs`),
  
  getResults: (id: string) => 
    api.get<any>(`/runs/${id}/results`),
  
  cancel: (id: string) => 
    api.post<Run>(`/runs/${id}/cancel`)
};

export default {
  groups: groupsApi,
  modules: modulesApi,
  canvas: canvasApi,
  runs: runsApi
}; 