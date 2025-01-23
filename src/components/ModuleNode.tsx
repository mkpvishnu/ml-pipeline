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
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import Editor from '@monaco-editor/react';

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
  const [code, setCode] = useState(data.code);

  return (
    <>
      <Paper
        sx={{
          p: 1,
          minWidth: 200,
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
          <Select
            size="small"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            sx={{ minWidth: 70, mr: 1 }}
          >
            <MenuItem value="v1">v1</MenuItem>
            <MenuItem value="v2">v2</MenuItem>
          </Select>
          <IconButton
            size="small"
            onClick={() => setIsEditorOpen(true)}
          >
            <CodeIcon />
          </IconButton>
        </Box>

        <Handle type="source" position={Position.Bottom} />
      </Paper>

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
    </>
  );
};

export default ModuleNode; 