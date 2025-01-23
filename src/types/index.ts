export interface Module {
  id: string;
  type: 'data' | 'preprocess' | 'training' | 'validation' | 'deployment';
  version: string;
  code: string;
  position: { x: number; y: number };
}

export interface Canvas {
  id: string;
  name: string;
  modules: Module[];
  connections: Connection[];
  version: string;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
}

export interface RunHistory {
  id: string;
  canvasId: string;
  status: 'success' | 'failed' | 'running';
  timestamp: string;
  moduleVersions: Record<string, string>;
  results: any;
}

export interface Schedule {
  id: string;
  canvasId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastRun: string;
  nextRun: string;
  active: boolean;
} 