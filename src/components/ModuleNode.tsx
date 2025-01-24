import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import {
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tooltip,
  Chip,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import CachedIcon from '@mui/icons-material/Cached';
import Editor from '@monaco-editor/react';
import ModuleCacheDialog from './ModuleCacheDialog';

interface Module {
  id: string;
  name: string;
  type: 'default' | 'custom';
}

interface ModuleNodeProps {
  data: {
    label: string;
    componentType: string;
    activeModule?: Module;
    onSettingsOpen: () => void;
  };
}

const ModuleNode: React.FC<ModuleNodeProps> = ({ data }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCacheDialogOpen, setIsCacheDialogOpen] = useState(false);
  const [moduleMenuAnchor, setModuleMenuAnchor] = useState<null | HTMLElement>(null);
  const [code, setCode] = useState('# Python code will be loaded based on active module');

  // Sample cache status - in real app, this would come from props or state management
  const cacheStatus = {
    available: true,
    size: '2.5GB',
    timestamp: '15 min ago',
  };

  // Sample available modules - in real app, this would come from props
  const availableModules: Module[] = [
    { id: 'bert', name: 'BERT Classifier', type: 'default' },
    { id: 'lstm', name: 'LSTM Classifier', type: 'custom' },
    { id: 'custom1', name: 'Custom Module 1', type: 'custom' },
  ];

  const handleModuleClick = (event: React.MouseEvent<HTMLElement>) => {
    setModuleMenuAnchor(event.currentTarget);
  };

  const handleModuleClose = () => {
    setModuleMenuAnchor(null);
  };

  return (
    <>
      <Paper
        sx={{
          p: 1.5,
          minWidth: 250,
          border: 1,
          borderColor: 'primary.main',
          bgcolor: 'background.paper',
        }}
      >
        <Handle type="target" position={Position.Top} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            {data.label}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {cacheStatus.available && (
              <Tooltip title={`Cache available (${cacheStatus.size}, ${cacheStatus.timestamp})`}>
                <Chip
                  icon={<CachedIcon />}
                  label="Cached"
                  size="small"
                  color="success"
                  onClick={() => setIsCacheDialogOpen(true)}
                  sx={{ mr: 1 }}
                />
              </Tooltip>
            )}
            
            <Chip
              label={data.activeModule?.name || 'No module selected'}
              size="small"
              color={data.activeModule ? 'primary' : 'default'}
              onClick={handleModuleClick}
              sx={{ mr: 1 }}
            />

            <Tooltip title="Component Settings">
              <IconButton
                size="small"
                onClick={data.onSettingsOpen}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="View Code">
              <IconButton
                size="small"
                onClick={() => setIsEditorOpen(true)}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Handle type="source" position={Position.Bottom} />
      </Paper>

      {/* Quick Module Selection Menu */}
      <Menu
        anchorEl={moduleMenuAnchor}
        open={Boolean(moduleMenuAnchor)}
        onClose={handleModuleClose}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
          Available Modules
        </Typography>
        {availableModules.map((module) => (
          <MenuItem
            key={module.id}
            onClick={handleModuleClose}
            selected={data.activeModule?.id === module.id}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {module.name}
              <Chip
                label={module.type}
                size="small"
                color={module.type === 'default' ? 'primary' : 'secondary'}
                sx={{ ml: 1 }}
              />
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Code Viewer Dialog */}
      <Dialog
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>View {data.activeModule?.name || 'Module'} Code</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              options={{
                readOnly: true,
                minimap: { enabled: false },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Module Cache Dialog */}
      <ModuleCacheDialog
        open={isCacheDialogOpen}
        onClose={() => setIsCacheDialogOpen(false)}
      />
    </>
  );
};

export default ModuleNode; 