import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import useStore from '../store';
import api from '../services/api';
import './CreateDrawer.css';

interface CreateDrawerProps {
  type: 'group' | 'canvas' | 'module';
  onClose: () => void;
  groupId?: string;
}

const CreateDrawer: React.FC<CreateDrawerProps> = ({ type, onClose, groupId }) => {
  const { setLoading, setGroups } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(`create${type}`, true);
    try {
      switch (type) {
        case 'group':
          const groupResponse = await api.groups.create({
            name,
            description
          });
          // Refresh groups list
          const groupsResponse = await api.groups.list();
          setGroups(groupsResponse.data);
          break;
        case 'canvas':
          await api.canvas.create({
            name,
            description,
            module_config: {
              nodes: [],
              edges: []
            }
          });
          break;
        case 'module':
          if (groupId) {
            await api.modules.create(groupId, {
              name,
              identifier,
              description,
              config_schema: {},
              user_config: {}
            });
            // Refresh groups list to show new module
            const modulesResponse = await api.groups.list();
            setGroups(modulesResponse.data);
          }
          break;
      }
      onClose();
    } finally {
      setLoading(`create${type}`, false);
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="create-drawer">
        <div className="drawer-header">
          <h3>Create {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <button className="btn btn-icon" onClick={onClose}>
            <FiX className="icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-content">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type} name`}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Enter ${type} description`}
              rows={3}
            />
          </div>

          {type === 'module' && (
            <div className="form-group">
              <label className="form-label" htmlFor="identifier">Identifier</label>
              <input
                id="identifier"
                type="text"
                className="form-control"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter module identifier"
                required
              />
            </div>
          )}

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateDrawer; 