import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../services/api';
import './NodeSettings.css';

interface NodeSettingsProps {
  nodeId: string;
  moduleId: string;
  onClose: () => void;
  onSave: (config: {
    name: string;
    description: string;
    user_config: Record<string, any>;
  }) => void;
}

interface ModuleConfig {
  name: string;
  description: string;
  config_schema: Record<string, any>;
  user_config?: Record<string, any>;
}

const NodeSettings: React.FC<NodeSettingsProps> = ({
  nodeId,
  moduleId,
  onClose,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [module, setModule] = useState<ModuleConfig | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userConfig, setUserConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.modules.get(moduleId);
        if (response.data) {
          setModule(response.data);
          setName(response.data.name);
          setDescription(response.data.description || '');
          setUserConfig(response.data.user_config || {});
        } else {
          setError('Module not found');
        }
      } catch (err) {
        console.error('Error fetching module:', err);
        setError('Failed to load module configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      user_config: userConfig,
    });
  };

  const renderSchemaField = (
    key: string,
    schema: any,
    value: any,
    onChange: (value: any) => void
  ) => {
    switch (schema.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.description}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={schema.description}
          />
        );
      case 'boolean':
        return (
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        );
      case 'array':
        return (
          <div className="array-field">
            {(value || []).map((item: any, index: number) => (
              <div key={index} className="array-item">
                <div className="array-item-content">
                  {renderSchemaField(
                    `${key}.${index}`,
                    schema.items,
                    item,
                    (newValue) => {
                      const newArray = [...(value || [])];
                      newArray[index] = newValue;
                      onChange(newArray);
                    }
                  )}
                </div>
                <button
                  type="button"
                  className="array-item-remove"
                  onClick={() => {
                    const newArray = [...(value || [])];
                    newArray.splice(index, 1);
                    onChange(newArray);
                  }}
                >
                  <FiX />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary array-add"
              onClick={() => onChange([...(value || []), null])}
            >
              Add Item
            </button>
          </div>
        );
      case 'object':
        return (
          <div className="object-field">
            <div className="object-field-properties">
              {Object.entries(schema.properties || {}).map(([propKey, propSchema]: [string, any]) => (
                <div key={propKey} className="schema-field">
                  <div className="schema-field-header">
                    <div className="schema-field-title">{propSchema.title || propKey}</div>
                    {propSchema.description && (
                      <div className="schema-field-description">{propSchema.description}</div>
                    )}
                  </div>
                  {renderSchemaField(
                    `${key}.${propKey}`,
                    propSchema,
                    (value || {})[propKey],
                    (newValue) => onChange({ ...(value || {}), [propKey]: newValue })
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="node-settings">Loading...</div>;
  }

  if (error || !module) {
    return (
      <div className="node-settings">
        <div className="error-message">{error || 'Module not found'}</div>
      </div>
    );
  }

  return (
    <div className="node-settings">
      <div className="node-settings-header">
        <div className="node-settings-title">Node Settings</div>
        <button className="node-settings-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="node-settings-content">
        <form onSubmit={handleSubmit} className="schema-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {module.config_schema && Object.entries(module.config_schema).map(([key, schema]) => (
            <div key={key} className="schema-field">
              <div className="schema-field-header">
                <div className="schema-field-title">{schema.title || key}</div>
                {schema.description && (
                  <div className="schema-field-description">{schema.description}</div>
                )}
              </div>
              {renderSchemaField(
                key,
                schema,
                userConfig[key],
                (value) => setUserConfig({ ...userConfig, [key]: value })
              )}
            </div>
          ))}

          <div className="node-settings-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeSettings; 