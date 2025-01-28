import React, { useEffect, useState } from 'react';
import { 
  FiFolder, 
  FiChevronRight, 
  FiBox, 
  FiPlus, 
  FiLoader,
  FiEdit2,
  FiTrash2,
  FiMoreVertical 
} from 'react-icons/fi';
import useStore from '../store';
import api from '../services/api';
import CreateDrawer from './CreateDrawer';
import EditDrawer from './EditDrawer';
import './LeftSidebar.css';

const LeftSidebar: React.FC = () => {
  const { groups, setGroups, updateGroup, deleteGroup, deleteModule } = useStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showEditModule, setShowEditModule] = useState(false);
  const [selectedModule, setSelectedModule] = useState<{ id: string; groupId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch groups and their modules
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.groups.list();
        console.log('Groups response:', response.data);
        
        if (Array.isArray(response.data)) {
          // Fetch modules for each group
          const groupsWithModules = await Promise.all(
            response.data.map(async (group) => {
              try {
                const modulesResponse = await api.modules.list(group.id);
                return {
                  ...group,
                  modules: modulesResponse.data
                };
              } catch (err) {
                console.error(`Error fetching modules for group ${group.id}:`, err);
                return {
                  ...group,
                  modules: []
                };
              }
            })
          );

          setGroups(groupsWithModules);
          
          // Expand the first group by default if there are groups
          if (groupsWithModules.length > 0) {
            setExpandedGroups(new Set([groupsWithModules[0].id]));
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
      // Fetch modules when expanding a group
      if (!groups.find(g => g.id === groupId)?.modules?.length) {
        api.modules.list(groupId).then(response => {
          updateGroup(groupId, { modules: response.data });
        }).catch(err => {
          console.error(`Error fetching modules for group ${groupId}:`, err);
        });
      }
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const onDragStart = (event: React.DragEvent, module: Module) => {
    try {
      const moduleData = {
        id: module.id,
        name: module.name,
        description: module.description,
        config_schema: module.config_schema,
        user_config: module.user_config
      };
      
      event.dataTransfer.setData('moduleId', module.id);
      event.dataTransfer.setData('moduleData', JSON.stringify(moduleData));
      event.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      console.error('Error starting drag:', err);
    }
  };

  const handleCreateModule = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setSelectedGroupId(groupId);
    setShowCreateModule(true);
  };

  const handleEditGroup = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setSelectedGroupId(groupId);
    setShowEditGroup(true);
  };

  const handleDeleteGroup = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await api.groups.delete(groupId);
        deleteGroup(groupId);
      } catch (err) {
        console.error('Error deleting group:', err);
        alert('Failed to delete group');
      }
    }
  };

  const handleEditModule = (e: React.MouseEvent, moduleId: string, groupId: string) => {
    e.stopPropagation();
    setSelectedModule({ id: moduleId, groupId });
    setShowEditModule(true);
  };

  const handleDeleteModule = async (e: React.MouseEvent, moduleId: string, groupId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await api.modules.delete(groupId, moduleId);
        deleteModule(groupId, moduleId);
      } catch (err) {
        console.error('Error deleting module:', err);
        alert('Failed to delete module');
      }
    }
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
                <div className="group-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => handleEditGroup(e, group.id)}
                    title="Edit Group"
                  >
                    <FiEdit2 className="icon" />
                  </button>
                  <button
                    className="action-btn"
                    onClick={(e) => handleDeleteGroup(e, group.id)}
                    title="Delete Group"
                  >
                    <FiTrash2 className="icon" />
                  </button>
                  <FiChevronRight className="icon-chevron" />
                </div>
              </div>
              
              <div className={`modules-container ${expandedGroups.has(group.id) ? 'expanded' : ''}`}>
                {group.modules && group.modules.map(module => (
                  <div
                    key={module.id}
                    className="module"
                    draggable
                    onDragStart={(e) => onDragStart(e, module)}
                  >
                    <div className="module-content">
                      <FiBox className="icon" />
                      <span className="module-name">{module.name}</span>
                    </div>
                    <div className="module-actions">
                      <button
                        className="action-btn"
                        onClick={(e) => handleEditModule(e, module.id, group.id)}
                        title="Edit Module"
                      >
                        <FiEdit2 className="icon" />
                      </button>
                      <button
                        className="action-btn"
                        onClick={(e) => handleDeleteModule(e, module.id, group.id)}
                        title="Delete Module"
                      >
                        <FiTrash2 className="icon" />
                      </button>
                    </div>
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

      {showEditGroup && selectedGroupId && (
        <EditDrawer
          type="group"
          id={selectedGroupId}
          onClose={() => {
            setShowEditGroup(false);
            setSelectedGroupId(null);
          }}
        />
      )}

      {showEditModule && selectedModule && (
        <EditDrawer
          type="module"
          id={selectedModule.id}
          groupId={selectedModule.groupId}
          onClose={() => {
            setShowEditModule(false);
            setSelectedModule(null);
          }}
        />
      )}
    </div>
  );
};

export default LeftSidebar; 