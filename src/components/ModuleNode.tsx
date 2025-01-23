import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import {
  Paper,
  Typography,
  IconButton,
  Select,
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
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CachedIcon from '@mui/icons-material/Cached';
import Editor from '@monaco-editor/react';
import ModelVersionDialog from './ModelVersionDialog';
import ModuleCacheDialog from './ModuleCacheDialog';

interface ModuleNodeProps {
  data: {
    label: string;
    version: string;
    code: string;
  };
}

const ModuleNode: React.FC<ModuleNodeProps> = ({ data }) => {
  const [version, setVersion] = useState(data.version);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isCacheDialogOpen, setIsCacheDialogOpen] = useState(false);
  const [code, setCode] = useState(data.code);

  // Sample cache status - in real app, this would come from props or state management
  const cacheStatus = {
    available: true,
    size: '2.5GB',
    timestamp: '15 min ago',
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
            
            <Select
              size="small"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              sx={{ minWidth: 70, mr: 1 }}
            >
              <MenuItem value="v1">v1</MenuItem>
              <MenuItem value="v2">v2</MenuItem>
              <MenuItem value="v3">v3</MenuItem>
            </Select>

            <Tooltip title="View Model Versions">
              <IconButton
                size="small"
                onClick={() => setIsVersionDialogOpen(true)}
              >
                <LocalOfferIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit Code">
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

      {/* Code Editor Dialog */}
      <Dialog
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit {data.label} Code</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditorOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              // TODO: Save code changes
              setIsEditorOpen(false);
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Model Version Dialog */}
      <ModelVersionDialog
        open={isVersionDialogOpen}
        onClose={() => setIsVersionDialogOpen(false)}
      />

      {/* Module Cache Dialog */}
      <ModuleCacheDialog
        open={isCacheDialogOpen}
        onClose={() => setIsCacheDialogOpen(false)}
      />
    </>
  );
};

export default ModuleNode; 