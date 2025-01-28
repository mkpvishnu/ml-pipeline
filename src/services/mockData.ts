import { Group, Module, Canvas, Run } from './api';

// Mock Data
export const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Data Processing',
    description: 'Modules for data processing and transformation',
    modules: []
  },
  {
    id: 'g2',
    name: 'Machine Learning',
    description: 'ML model training and inference modules',
    modules: []
  },
  {
    id: 'g3',
    name: 'Visualization',
    description: 'Data visualization and reporting modules',
    modules: []
  }
];

export const mockModules: Record<string, Module[]> = {
  g1: [
    {
      id: 'm1',
      name: 'CSV Reader',
      identifier: 'csv_reader',
      description: 'Read data from CSV files',
      scope: 'global',
      config_schema: {
        filepath: {
          type: 'string',
          title: 'File Path',
          description: 'Path to the CSV file',
          required: true
        },
        delimiter: {
          type: 'string',
          title: 'Delimiter',
          description: 'CSV delimiter character',
          default: ','
        },
        encoding: {
          type: 'string',
          title: 'Encoding',
          description: 'File encoding',
          default: 'utf-8'
        }
      },
      user_config: {
        filepath: '/data/sample.csv',
        delimiter: ',',
        encoding: 'utf-8'
      }
    },
    {
      id: 'm2',
      name: 'Data Cleaner',
      identifier: 'data_cleaner',
      description: 'Clean and preprocess data',
      scope: 'global',
      config_schema: {
        operations: {
          type: 'array',
          title: 'Cleaning Operations',
          description: 'List of cleaning operations to perform',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                title: 'Operation Type',
                description: 'Type of cleaning operation'
              },
              column: {
                type: 'string',
                title: 'Column',
                description: 'Column to apply operation on'
              }
            }
          }
        }
      },
      user_config: {
        operations: [
          { type: 'remove_nulls', column: 'age' },
          { type: 'normalize', column: 'salary' }
        ]
      }
    }
  ],
  g2: [
    {
      id: 'm3',
      name: 'Linear Regression',
      identifier: 'linear_regression',
      description: 'Train a linear regression model',
      scope: 'global',
      config_schema: {
        features: {
          type: 'array',
          title: 'Feature Columns',
          description: 'List of feature column names',
          required: true
        },
        target: {
          type: 'string',
          title: 'Target Column',
          description: 'Target column name',
          required: true
        },
        test_size: {
          type: 'number',
          title: 'Test Size',
          description: 'Fraction of data to use for testing',
          default: 0.2
        }
      },
      user_config: {
        features: ['age', 'experience'],
        target: 'salary',
        test_size: 0.2
      }
    },
    {
      id: 'm4',
      name: 'Custom Model',
      identifier: 'custom_model',
      description: 'A custom ML model',
      scope: 'account',
      config_schema: {
        model_path: {
          type: 'string',
          title: 'Model Path',
          description: 'Path to saved model',
          required: true
        },
        batch_size: {
          type: 'number',
          title: 'Batch Size',
          description: 'Batch size for inference',
          default: 32
        }
      },
      user_config: {
        model_path: '/models/custom.pkl',
        batch_size: 32
      }
    }
  ],
  g3: [
    {
      id: 'm5',
      name: 'Line Plot',
      identifier: 'line_plot',
      description: 'Create line plots',
      scope: 'global',
      config_schema: {
        x_column: {
          type: 'string',
          title: 'X Column',
          description: 'Column for X axis',
          required: true
        },
        y_columns: {
          type: 'array',
          title: 'Y Columns',
          description: 'Columns for Y axis',
          required: true
        },
        title: {
          type: 'string',
          title: 'Plot Title',
          description: 'Title of the plot'
        }
      },
      user_config: {
        x_column: 'date',
        y_columns: ['price', 'volume'],
        title: 'Stock Price Analysis'
      }
    }
  ]
};

export const mockCanvases: Canvas[] = [
  {
    id: 'c1',
    name: 'Data Analysis Pipeline',
    description: 'Pipeline for analyzing stock data',
    module_config: {
      nodes: [
        {
          id: 'node1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { moduleId: 'm1' }
        },
        {
          id: 'node2',
          type: 'custom',
          position: { x: 300, y: 100 },
          data: { moduleId: 'm2' }
        },
        {
          id: 'node3',
          type: 'custom',
          position: { x: 500, y: 100 },
          data: { moduleId: 'm5' }
        }
      ],
      edges: [
        {
          id: 'e1-2',
          source: 'node1',
          target: 'node2'
        },
        {
          id: 'e2-3',
          source: 'node2',
          target: 'node3'
        }
      ]
    }
  }
];

export const mockRuns: Record<string, Run[]> = {
  c1: [
    {
      id: 'r1',
      status: 'COMPLETED',
      started_at: '2024-01-15T10:00:00Z',
      completed_at: '2024-01-15T10:05:00Z',
      logs: [
        '[10:00:00] Starting pipeline execution',
        '[10:00:01] Reading CSV file...',
        '[10:00:02] Cleaning data...',
        '[10:00:03] Generating visualizations...',
        '[10:05:00] Pipeline execution completed'
      ],
      results: {
        processed_rows: 1000,
        cleaned_rows: 950,
        plots_generated: 2
      }
    },
    {
      id: 'r2',
      status: 'ERROR',
      started_at: '2024-01-15T11:00:00Z',
      completed_at: '2024-01-15T11:00:30Z',
      error: {
        message: 'Failed to read CSV file',
        details: 'File not found: /data/sample.csv'
      },
      logs: [
        '[11:00:00] Starting pipeline execution',
        '[11:00:01] Error: Failed to read CSV file',
        '[11:00:30] Pipeline execution failed'
      ]
    }
  ]
};

// Mock API functions
export const mockApi = {
  groups: {
    list: async () => ({ data: mockGroups }),
    get: async (id: string) => ({ 
      data: mockGroups.find(g => g.id === id) 
    }),
    create: async (data: any) => ({
      data: { id: `g${Date.now()}`, ...data, modules: [] }
    }),
    update: async (id: string, data: any) => ({
      data: { ...mockGroups.find(g => g.id === id), ...data }
    }),
    delete: async (id: string) => ({ data: null })
  },

  modules: {
    list: async (groupId: string) => ({ 
      data: mockModules[groupId] || [] 
    }),
    get: async (moduleId: string) => {
      // Find the module in all groups
      for (const groupModules of Object.values(mockModules)) {
        const module = groupModules.find(m => m.id === moduleId);
        if (module) {
          return { data: module };
        }
      }
      return { data: undefined };
    },
    create: async (groupId: string, data: any) => ({
      data: { id: `m${Date.now()}`, ...data }
    }),
    update: async (groupId: string, id: string, data: any) => ({
      data: { ...mockModules[groupId]?.find(m => m.id === id), ...data }
    }),
    updateConfig: async (groupId: string, id: string, config: any) => ({
      data: { 
        ...mockModules[groupId]?.find(m => m.id === id),
        user_config: config
      }
    }),
    delete: async (groupId: string, id: string) => ({ data: null })
  },

  canvas: {
    list: async () => ({ data: mockCanvases }),
    get: async (id: string) => ({
      data: mockCanvases.find(c => c.id === id)
    }),
    create: async (data: any) => ({
      data: { id: `c${Date.now()}`, ...data }
    }),
    update: async (id: string, data: any) => ({
      data: { ...mockCanvases.find(c => c.id === id), ...data }
    }),
    updateConfig: async (id: string, config: any) => ({
      data: {
        ...mockCanvases.find(c => c.id === id),
        module_config: config
      }
    }),
    delete: async (id: string) => ({ data: null })
  },

  runs: {
    list: async (params?: { canvas_id?: string }) => ({
      data: params?.canvas_id ? mockRuns[params.canvas_id] || [] : []
    }),
    get: async (id: string) => ({
      data: Object.values(mockRuns)
        .flat()
        .find(r => r.id === id)
    }),
    getStatus: async (id: string) => ({
      data: {
        status: Object.values(mockRuns)
          .flat()
          .find(r => r.id === id)
          ?.status
      }
    }),
    getLogs: async (id: string) => ({
      data: Object.values(mockRuns)
        .flat()
        .find(r => r.id === id)
        ?.logs || []
    }),
    getResults: async (id: string) => ({
      data: Object.values(mockRuns)
        .flat()
        .find(r => r.id === id)
        ?.results
    })
  }
};