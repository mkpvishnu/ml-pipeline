import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import useStore from '../store';
import api from '../services/api';

interface RightDrawerProps {
  moduleId: string;
}

const RightDrawer: React.FC<RightDrawerProps> = ({ moduleId }) => {
  const { setSelectedModule, setLoading } = useStore();
  const [module, setModule] = useState<any>(null);
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchModule = async () => {
      setLoading(`fetchModule-${moduleId}`, true);
      try {
        const response = await api.modules.get(moduleId);
        setModule(response.data);
        setConfig(response.data.user_config || {});
      } finally {
        setLoading(`fetchModule-${moduleId}`, false);
      }
    };

    fetchModule();
  }, [moduleId]);

  const handleClose = () => {
    setSelectedModule(null);
  };

  const handleSave = async () => {
    setLoading(`saveConfig-${moduleId}`, true);
    try {
      await api.modules.updateConfig(moduleId, config);
    } finally {
      setLoading(`saveConfig-${moduleId}`, false);
    }
  };

  const renderConfigField = (key: string, schema: any) => {
    const value = config[key] ?? schema.default;

    switch (schema.type) {
      case 'number':
        return (
          <input
            type="number"
            className="form-control"
            value={value}
            min={schema.min}
            max={schema.max}
            step={schema.step || 1}
            onChange={(e) => 
              setConfig({ ...config, [key]: parseFloat(e.target.value) })
            }
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            className="form-checkbox"
            checked={value}
            onChange={(e) => 
              setConfig({ ...config, [key]: e.target.checked })
            }
          />
        );

      case 'string':
        return (
          <input
            type="text"
            className="form-control"
            value={value}
            onChange={(e) => 
              setConfig({ ...config, [key]: e.target.value })
            }
          />
        );

      default:
        return null;
    }
  };

  if (!module) return null;

  return (
    <div className="right-drawer">
      <div className="drawer-header">
        <h3>Module Settings</h3>
        <button 
          className="btn btn-icon" 
          onClick={handleClose}
          title="Close"
        >
          <FiX className="icon" />
        </button>
      </div>

      <div className="drawer-content">
        <div className="form-group">
          <label className="form-label">Name</label>
          <div className="form-static">{module.name}</div>
        </div>

        {Object.entries(module.config_schema).map(([key, schema]: [string, any]) => (
          <div key={key} className="form-group">
            <label className="form-label">{key}</label>
            {renderConfigField(key, schema)}
          </div>
        ))}
      </div>

      <div className="drawer-footer">
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>

      <style jsx>{`
        .right-drawer {
          width: 300px;
          background-color: var(--background-secondary);
          border-left: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .drawer-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .drawer-footer {
          padding: 16px;
          border-top: 1px solid var(--border-light);
          display: flex;
          justify-content: flex-end;
        }

        .form-static {
          padding: 6px 0;
          color: var(--text-secondary);
        }

        .form-checkbox {
          width: 16px;
          height: 16px;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
};

export default RightDrawer; 