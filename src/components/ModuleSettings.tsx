import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import useStore from '../store';
import api from '../services/api';
import './ModuleSettings.css';

interface ModuleSettingsProps {
  moduleId: string;
  groupId: string;
  onClose: () => void;
}

interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  title: string;
  description?: string;
  default?: any;
  required?: boolean;
  items?: {
    type: string;
    properties?: Record<string, ConfigField>;
  };
  properties?: Record<string, ConfigField>;
}

const ModuleSettings: React.FC<ModuleSettingsProps> = ({ moduleId, groupId, onClose }) => {
  const { updateModule } = useStore();
  const [configSchema, setConfigSchema] = useState<Record<string, ConfigField>>({});
  const [userConfig, setUserConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.modules.get(groupId, moduleId);
        setConfigSchema(response.data.config_schema || {});
        setUserConfig(response.data.user_config || {});
      } catch (err) {
        console.error('Error fetching module:', err);
        setError('Failed to load module configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModule();
  }, [moduleId, groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.modules.updateConfig(groupId, moduleId, userConfig);
      updateModule(moduleId, { user_config: userConfig });
      onClose();
    } catch (err) {
      console.error('Error updating module config:', err);
      setError('Failed to update configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (key: string, field: ConfigField, path: string = '') => {
    const currentPath = path ? `${path}.${key}` : key;
    const value = path ? 
      path.split('.').reduce((obj, key) => obj?.[key], userConfig)?.[key] : 
      userConfig[key];

    const updateValue = (newValue: any) => {
      setUserConfig(prev => {
        const newConfig = { ...prev };
        if (path) {
          const pathParts = path.split('.');
          let current = newConfig;
          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (i === pathParts.length - 1) {
              current[part] = { ...current[part], [key]: newValue };
            } else {
              current[part] = { ...current[part] };
              current = current[part];
            }
          }
        } else {
          newConfig[key] = newValue;
        }
        return newConfig;
      });
    };

    switch (field.type) {
      case 'string':
        return (
          <div className="form-group" key={currentPath}>
            <label>
              {field.title}
              {field.required && <span className="required">*</span>}
            </label>
            {field.description && (
              <div className="field-description">{field.description}</div>
            )}
            <input
              type="text"
              value={value || ''}
              onChange={(e) => updateValue(e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'number':
        return (
          <div className="form-group" key={currentPath}>
            <label>
              {field.title}
              {field.required && <span className="required">*</span>}
            </label>
            {field.description && (
              <div className="field-description">{field.description}</div>
            )}
            <input
              type="number"
              value={value || ''}
              onChange={(e) => updateValue(Number(e.target.value))}
              required={field.required}
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="form-group checkbox" key={currentPath}>
            <label>
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => updateValue(e.target.checked)}
              />
              {field.title}
              {field.required && <span className="required">*</span>}
            </label>
            {field.description && (
              <div className="field-description">{field.description}</div>
            )}
          </div>
        );

      case 'object':
        if (!field.properties) return null;
        return (
          <div className="form-group object-group" key={currentPath}>
            <label>{field.title}</label>
            {field.description && (
              <div className="field-description">{field.description}</div>
            )}
            <div className="object-fields">
              {Object.entries(field.properties).map(([propKey, propField]) =>
                renderField(propKey, propField, currentPath)
              )}
            </div>
          </div>
        );

      case 'array':
        // For now, we'll just show it as a JSON textarea
        return (
          <div className="form-group" key={currentPath}>
            <label>
              {field.title}
              {field.required && <span className="required">*</span>}
            </label>
            {field.description && (
              <div className="field-description">{field.description}</div>
            )}
            <textarea
              value={JSON.stringify(value || [], null, 2)}
              onChange={(e) => {
                try {
                  updateValue(JSON.parse(e.target.value));
                  setError(null);
                } catch {
                  setError('Invalid JSON array');
                }
              }}
              rows={5}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="drawer-overlay">
      <div className="drawer">
        <div className="drawer-header">
          <h2>Module Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="drawer-content">
            {error && <div className="error-message">{error}</div>}
            
            {isLoading ? (
              <div className="loading-message">Loading configuration...</div>
            ) : (
              Object.entries(configSchema).map(([key, field]) =>
                renderField(key, field)
              )
            )}
          </div>

          <div className="drawer-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleSettings; 