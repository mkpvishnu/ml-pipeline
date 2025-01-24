import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  IconButton,
  TextField,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface Module {
  id: string;
  name: string;
  type: 'default' | 'custom';
  code: string;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  componentId: string;
  componentType: string;
}

const defaultModules: Record<string, Module[]> = {
  classifier: [
    {
      id: 'bert-classifier',
      name: 'BERT Classifier',
      type: 'default',
      code: 'from transformers import AutoModelForSequenceClassification\n\ndef classify(text):\n    model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased")\n    return model(text)',
      isActive: false,
    },
    {
      id: 'lstm-classifier',
      name: 'LSTM Classifier',
      type: 'default',
      code: 'import torch.nn as nn\n\nclass LSTMClassifier(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.lstm = nn.LSTM(input_size=100, hidden_size=64)\n        self.fc = nn.Linear(64, 2)',
      isActive: false,
    },
  ],
  data_loader: [
    {
      id: 'csv-loader',
      name: 'CSV Loader',
      type: 'default',
      code: 'import pandas as pd\n\ndef load_data(path):\n    return pd.read_csv(path)',
      isActive: false,
    },
  ],
};

const ComponentDrawer: React.FC<Props> = ({ open, onClose, componentId, componentType }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [modules, setModules] = useState<Module[]>(defaultModules[componentType] || []);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [output, setOutput] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCode, setEditingCode] = useState('');

  const handleUseModule = (moduleId: string) => {
    setModules(prevModules =>
      prevModules.map(m => ({
        ...m,
        isActive: m.id === moduleId,
      }))
    );
  };

  const handleCreateModule = () => {
    const newModule: Module = {
      id: `custom-${Date.now()}`,
      name: 'New Custom Module',
      type: 'custom',
      code: '# Write your custom code here\n',
      isActive: false,
    };
    setModules([...modules, newModule]);
    setSelectedModule(newModule);
    setIsEditing(true);
    setEditingCode(newModule.code);
  };

  const handleExecuteCode = () => {
    if (selectedModule) {
      // Simulate code execution
      setOutput(`Executing ${selectedModule.name}...\nOutput will appear here`);
    }
  };

  const handleSaveCode = () => {
    if (selectedModule) {
      setModules(prevModules =>
        prevModules.map(m =>
          m.id === selectedModule.id ? { ...m, code: editingCode } : m
        )
      );
      setIsEditing(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{ width: 400, flexShrink: 0 }}
    >
      <Box sx={{ width: 400 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Component Settings</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Modules" />
          <Tab label="Output" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {activeTab === 0 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateModule}
                >
                  Create Module
                </Button>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                Default Modules
              </Typography>
              <List>
                {modules
                  .filter(m => m.type === 'default')
                  .map(module => (
                    <ListItem
                      key={module.id}
                      secondaryAction={
                        <Button
                          variant={module.isActive ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => handleUseModule(module.id)}
                        >
                          {module.isActive ? 'Active' : 'Use'}
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={module.name}
                        onClick={() => {
                          setSelectedModule(module);
                          setEditingCode(module.code);
                        }}
                      />
                    </ListItem>
                  ))}
              </List>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Custom Modules
              </Typography>
              <List>
                {modules
                  .filter(m => m.type === 'custom')
                  .map(module => (
                    <ListItem
                      key={module.id}
                      secondaryAction={
                        <Button
                          variant={module.isActive ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => handleUseModule(module.id)}
                        >
                          {module.isActive ? 'Active' : 'Use'}
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={module.name}
                        onClick={() => {
                          setSelectedModule(module);
                          setEditingCode(module.code);
                        }}
                      />
                    </ListItem>
                  ))}
              </List>

              {selectedModule && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">
                      {selectedModule.name} Code
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {isEditing ? (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleSaveCode}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CodeIcon />}
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleExecuteCode}
                      >
                        Run
                      </Button>
                    </Box>
                  </Box>
                  <TextField
                    multiline
                    fullWidth
                    rows={10}
                    value={isEditing ? editingCode : selectedModule.code}
                    onChange={(e) => setEditingCode(e.target.value)}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}

          {activeTab === 1 && (
            <Paper
              sx={{
                p: 2,
                bgcolor: 'grey.900',
                color: 'common.white',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                minHeight: 200,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <pre>{output || 'No output yet'}</pre>
            </Paper>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default ComponentDrawer; 