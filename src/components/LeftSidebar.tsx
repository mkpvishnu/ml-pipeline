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
// import api from '../services/api';
import CreateDrawer from './CreateDrawer';
import EditDrawer from './EditDrawer';
import './LeftSidebar.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useApiRender } from '../context/ApiRenderContext';
import { DOMAIN, ACCOUNT_ID } from '../constants/app';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const LeftSidebar: React.FC = ({ canvasId, setCanvasId, tabValue, setTabValue }) => {
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
  const [listCanvas, setListCanvas] = useState([]);
  const [open, setOpen] = React.useState(null);

  const { shouldRerender } = useApiRender();

  const fetchGroupsWithModules = async () => {
    fetch(`${DOMAIN}/api/v1/groups/?skip=0&limit=100`, {
      headers: {
        'Content-Type': 'application/json',
        'account-id': ACCOUNT_ID,
        accept: 'application/json',
      },
    }).then(response => {
      if (!response.ok) { 
        // If server returns an error status (e.g., 500)
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      // console.log('Success:', data);
      setGroups(data)
      // Expand the first group by default if there are groups
      if (data.length > 0) {
        setExpandedGroups(new Set([data[0].id]));
      }
    }).catch((error) => {
      console.error('Error fetching groups:', error);
      setError('Failed to load groups');
      setGroups([]);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    const fetchCanvas = () => {
      fetch(`${DOMAIN}/api/v1/canvas/?skip=0&limit=100`, {
        headers: {
          'Content-Type': 'application/json',
          'account-id': ACCOUNT_ID,
          accept: 'application/json',
        },
      }).then(response => {
        if (!response.ok) { 
          // If server returns an error status (e.g., 500)
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        // console.log('Success:', data);
        setListCanvas(data)
      }).catch((error) => {
        console.error('Error fetching canvas:', error);
        setError('Failed to load canvas');
        setListCanvas([]);
      }).finally(() => {
        setIsLoading(false);
      });
    }

    setIsLoading(true);
    if (tabValue === 0) {
      fetchGroupsWithModules();
    } else {
      fetchCanvas()
    }
  }, [shouldRerender, tabValue]);

  // console.log({ groups, expandedGroups });

  const toggleGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      // Fetch modules when expanding a group
      // if (!groups.find(g => g.id === groupId)?.modules?.length) {
      //   api.modules.list(groupId).then(response => {
      //     updateGroup(groupId, { modules: response.data });
      //   }).catch(err => {
      //     console.error(`Error fetching modules for group ${groupId}:`, err);
      //   });
      // }
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const onDragStart = (event: React.DragEvent, group_id, module: Module) => {
    try {
      // const moduleData = {
      //   id: module.id,
      //   name: module.name,
      //   description: module.description,
      //   config_schema: module.config_schema,
      //   user_config: module.user_config,
      //   output_schema: module.output_schema,
      // };
      event.dataTransfer.setData('moduleId', module.id);
      event.dataTransfer.setData('moduleData', JSON.stringify(module));
      event.dataTransfer.setData('groupId', JSON.stringify(group_id));
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

  // const handleEditGroup = (e: React.MouseEvent, groupId: string) => {
  //   e.stopPropagation();
  //   setSelectedGroupId(groupId);
  //   setShowEditGroup(true);
  // };

  // const handleDeleteGroup = async (e: React.MouseEvent, groupId: string) => {
  //   e.stopPropagation();
  //   if (window.confirm('Are you sure you want to delete this group?')) {
  //     try {
  //       await api.groups.delete(groupId);
  //       deleteGroup(groupId);
  //     } catch (err) {
  //       console.error('Error deleting group:', err);
  //       alert('Failed to delete group');
  //     }
  //   }
  // };

  // const handleEditModule = (e: React.MouseEvent, moduleId: string, groupId: string) => {
  //   e.stopPropagation();
  //   setSelectedModule({ id: moduleId, groupId });
  //   setShowEditModule(true);
  // };

  const handleClickOpen = (moduleId: string, name, groupId: string) => {
    setOpen({ moduleId, name, groupId });
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleDeleteModule = () => {
    fetch(`${DOMAIN}/api/v1/modules/${open.moduleId}?x=12`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'account-id': ACCOUNT_ID
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // If the API returns a response
    })
    .then(data => {
      console.log('Delete successful:', data);
      // refresh the groups list
      fetchGroupsWithModules();
    })
    .catch(error => console.error('Error:', error))
    .finally(() => setOpen(null))
  }

  // if (isLoading) {
  //   return (
  //     <div className="left-sidebar">
  //       <div className="loading-state">
  //         <FiLoader className="icon spin" />
  //         <span>Loading groups...</span>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="left-sidebar">
  //       <div className="error-state">
  //         <span>{error}</span>
  //         <button 
  //           className="btn btn-secondary" 
  //           onClick={() => window.location.reload()}
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
    // API to fetch releavant tab items eg: list of modules / list of canvas
    // templates will vary among the tabs
    // right side we should able to populate the selected tab details to load the complete node details
  };

  const onCanvasClick = (value) => {
    setCanvasId(value);
    setTabValue(0);
  }

  const renderTabContent = () => {
    if(isLoading) {
      return (
        <div className='groups-container'>
          <Stack spacing={1}>
            <Skeleton width="40%" animation="wave"/>
            <Skeleton width="60%" animation="wave"/>
            <Skeleton variant="text" animation="wave"/>
          </Stack>
        </div>
      )
    }
    if (tabValue == 0) {
      return (
        <div className="groups-container">
          {groups && groups.length > 0 ? (
            groups.map(group => (
              <div key={group.id} className="group">
                <div 
                  className={`group-header ${expandedGroups.has(group.id) ? 'expanded' : ''}`}
                  onClick={(e) => toggleGroup(group.id, e)}
                >
                  <div className="group-header-content">
                    <img src={group.icon_url} height="16" width="16" />
                    <span className="group-name">{group.name}</span>
                  </div>
                  {/* <div className="group-actions">
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
                  </div> */}
                </div>
                
                <div className={`modules-container ${expandedGroups.has(group.id) ? 'expanded' : ''}`}>
                  {group.modules && group.modules.map(module => (
                    <div
                      key={module.id}
                      className="module"
                      draggable
                      onDragStart={(e) => onDragStart(e, group.id, module)}
                    >
                      <div className="module-content">
                        {/* <FiBox className="icon" /> */}
                        <img src={module.icon_url} height="16" width="16" />
                        <span className="module-name">{module.name}</span>
                      </div>
                      {module.type === 'custom' ? (
                        <div className="module-actions">
                          {/* <button
                            className="action-btn"
                            onClick={(e) => handleEditModule(e, module.id, group.id)}
                            title="Edit Module"
                          >
                            <FiEdit2 className="icon" />
                          </button> */}
                          <button
                            className="action-btn"
                            onClick={(e) => handleClickOpen(module.id, module.name, group.id)}
                            title="Delete Module"
                          >
                            <FiTrash2 className="icon" />
                          </button>
                        </div>
                      ) : null}
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
      )
    }
    return (
      <div className="groups-container">
        {listCanvas.map(l => <button key={l.id} className='canvas-btn' onClick={() => onCanvasClick(l.id)}>{l.name}</button> )}
      </div>
    )
  }

  return (
    <div className="left-sidebar">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Modules" {...a11yProps(0)} />
          <Tab label="Canvas" {...a11yProps(1)} />
        </Tabs>
      </Box>
      {renderTabContent()}

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
      <Dialog
        open={Boolean(open?.moduleId)}
        onClose={handleClose}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          Delete module
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure want to delete the {open?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleDeleteModule}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeftSidebar; 