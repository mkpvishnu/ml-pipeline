import axios from 'axios';
import { mockApi } from './mockData';

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

// For demo, we'll use the mock API
export default mockApi;