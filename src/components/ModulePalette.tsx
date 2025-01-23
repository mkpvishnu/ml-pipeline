import React from 'react';
import { Box, Paper, Typography, List, ListItem } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const modules = [
  { type: 'data', label: 'Data Source', icon: StorageIcon },
  { type: 'preprocess', label: 'Preprocessing', icon: BuildIcon },
  { type: 'training', label: 'Training', icon: SchoolIcon },
  { type: 'validation', label: 'Validation', icon: CheckCircleIcon },
  { type: 'deployment', label: 'Deployment', icon: CloudUploadIcon },
];

const ModulePalette: React.FC = () => {
  const onDragStart = (event: React.DragEvent, moduleType: string) => {
    event.dataTransfer.setData('application/reactflow', moduleType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper
      sx={{
        width: 240,
        borderRight: 1,
        borderColor: 'divider',
        overflow: 'auto',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Modules
        </Typography>
        <List>
          {modules.map(({ type, label, icon: Icon }) => (
            <ListItem
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              sx={{
                cursor: 'grab',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Icon sx={{ mr: 1 }} />
              <Typography>{label}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default ModulePalette; 