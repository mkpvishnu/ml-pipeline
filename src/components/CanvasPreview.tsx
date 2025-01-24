import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CanvasPreview: React.FC<Props> = ({ open, onClose }) => {
  const [isRunning, setIsRunning] = React.useState(false);
  const [output, setOutput] = React.useState<string>('');

  const handleRunCanvas = () => {
    setIsRunning(true);
    // Simulate canvas execution
    setTimeout(() => {
      setOutput(`Canvas execution started at ${new Date().toISOString()}
Running component: Data Loader
- Loading data from source...
- Data loaded successfully: 1000 records

Running component: Classifier
- Preprocessing data...
- Training model...
- Model training complete
- Accuracy: 0.92
- F1 Score: 0.91

Running component: Model Evaluator
- Generating evaluation metrics...
- Confusion matrix saved
- ROC curve generated

Execution completed successfully!`);
      setIsRunning(false);
    }, 2000);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{ width: 500, flexShrink: 0 }}
    >
      <Box sx={{ width: 500 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Canvas Preview</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={isRunning ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              onClick={handleRunCanvas}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Canvas'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setOutput('')}
              disabled={isRunning}
            >
              Clear Output
            </Button>
          </Box>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'grey.900',
              color: 'common.white',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              minHeight: 'calc(100vh - 200px)',
              overflow: 'auto',
            }}
          >
            <pre>{output || 'No output yet. Click "Run Canvas" to execute the pipeline.'}</pre>
          </Paper>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CanvasPreview; 