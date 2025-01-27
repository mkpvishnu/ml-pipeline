import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import useStore from '../store';
import api from '../services/api';
import './EditDrawer.css';

interface EditDrawerProps {
  type: 'group' | 'module' | 'canvas';
  id: string;
  groupId?: string;
  onClose: () => void;
}

const EditDrawer: React.FC<EditDrawerProps> = ({ type, id, groupId, onClose }) => {
  const { updateGroup, updateModule, updateCanvas } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [configSchema, setConfigSchema] = useState<Record<string, any>>({});
  const [userConfig, setUserConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let response;
        switch (type) {
          case 'group':
            response = await api.groups.get(id);
            setName(response.data.name);
            setDescription(response.data.description || '');
            break;
          case 'module':
            if (!groupId) throw new Error('Group ID is required for modules');
            response = await api.modules.get(groupId, id);
            setName(response.data.name);
            setDescription(response.data.description || '');
            setConfigSchema(response.data.config_schema || {});
            setUserConfig(response.data.user_config || {});
            break;
          case 'canvas':
            response = await api.canvas.get(id);
            setName(response.data.name);
            setDescription(response.data.description || '');
            break;
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, id, groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      switch (type) {
        case 'group':
          await api.groups.update(id, { name, description });
          updateGroup(id, { name, description });
          break;
        case 'module':
          if (!groupId) throw new Error('Group ID is required for modules');
          await api.modules.update(groupId, id, { 
            name, 
            description,
            config_schema: configSchema
          });
          updateModule(id, { 
            name, 
            description,
            config_schema: configSchema,
            user_config: userConfig
          });
          break;
        case 'canvas':
          await api.canvas.update(id, { name, description });
          updateCanvas(id, { name, description });
          break;
      }
      onClose();
    } catch (err) {
      console.error('Error updating:', err);
      setError('Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfigFields = () => {
    if (type !== 'module') return null;

    return (
      <>
        <div className="form-group">
          <label>Config Schema</label>
          <textarea
            value={JSON.stringify(configSchema, null, 2)}
            onChange={(e) => {
              try {
                setConfigSchema(JSON.parse(e.target.value));
                setError(null);
              } catch {
                setError('Invalid JSON');
              }
            }}
            rows={5}
          />
        </div>
        <div className="form-group">
          <label>User Config</label>
          <textarea
            value={JSON.stringify(userConfig, null, 2)}
            onChange={(e) => {
              try {
                setUserConfig(JSON.parse(e.target.value));
                setError(null);
              } catch {
                setError('Invalid JSON');
              }
            }}
            rows={5}
          />
        </div>
      </>
    );
  };

  return (
    <div className="drawer-overlay">
      <div className="drawer">
        <div className="drawer-header">
          <h2>Edit {type}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="drawer-content">
            {error && <div className="error-message">{error}</div>}
            
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

            {renderConfigFields()}
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

export default EditDrawer; 