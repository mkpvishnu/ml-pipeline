import React, { useEffect, useState } from 'react';
import { FiFolder, FiChevronRight, FiBox, FiPlus, FiLoader } from 'react-icons/fi';
import useStore from '../store';
import api from '../services/api';
import CreateDrawer from './CreateDrawer';
import './LeftSidebar.css';

const LeftSidebar: React.FC = () => {
  const { groups, setGroups } = useStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.groups.list();
        console.log('Groups response:', response.data); // Debug log
        if (Array.isArray(response.data)) {
          setGroups(response.data);
          // Expand the first group by default if there are groups
          if (response.data.length > 0) {
            setExpandedGroups(new Set([response.data[0].id]));
          }
        } else {
          throw new Error('Invalid groups data received');
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups');
        setGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const toggleGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const onDragStart = (event: React.DragEvent, moduleId: string) => {
    event.dataTransfer.setData('moduleId', moduleId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleCreateModule = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setSelectedGroupId(groupId);
    setShowCreateModule(true);
  };

  if (isLoading) {
    return (
      <div className="left-sidebar">
        <div className="loading-state">
          <FiLoader className="icon spin" />
          <span>Loading groups...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="left-sidebar">
        <div className="error-state">
          <span>{error}</span>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="left-sidebar">
      <div className="groups-container">
        {groups && groups.length > 0 ? (
          groups.map(group => (
            <div key={group.id} className="group">
              <div 
                className={`group-header ${expandedGroups.has(group.id) ? 'expanded' : ''}`}
                onClick={(e) => toggleGroup(group.id, e)}
              >
                <div className="group-header-content">
                  <FiFolder className="icon" />
                  <span className="group-name">{group.name}</span>
                </div>
                <FiChevronRight className="icon-chevron" />
              </div>
              
              <div className={`modules-container ${expandedGroups.has(group.id) ? 'expanded' : ''}`}>
                {group.modules && group.modules.map(module => (
                  <div
                    key={module.id}
                    className="module"
                    draggable
                    onDragStart={(e) => onDragStart(e, module.id)}
                  >
                    <FiBox className="icon" />
                    <span className="module-name">{module.name}</span>
                  </div>
                ))}
                <button
                  className="add-module-btn"
                  onClick={(e) => handleCreateModule(e, group.id)}
                >
                  <FiPlus className="icon" />
                  <span>Add Module</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span>No groups found</span>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowCreateGroup(true)}
            >
              Create Group
            </button>
          </div>
        )}
      </div>

      {showCreateModule && selectedGroupId && (
        <CreateDrawer
          type="module"
          groupId={selectedGroupId}
          onClose={() => {
            setShowCreateModule(false);
            setSelectedGroupId(null);
          }}
        />
      )}

      {showCreateGroup && (
        <CreateDrawer
          type="group"
          onClose={() => setShowCreateGroup(false)}
        />
      )}
    </div>
  );
};

export default LeftSidebar; 