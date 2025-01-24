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

const DRAWER_WIDTH = 500;

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

  if (!open) return null;

  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        bgcolor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 24,
        transition: (theme) => theme.transitions.create(['transform'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        transform: open ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      <Box sx={{ 
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
      }}>
        <Typography variant="h6">Canvas Preview</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      }}>
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
            flex: 1,
            p: 2,
            bgcolor: 'grey.900',
            color: 'common.white',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflow: 'auto',
          }}
        >
          <pre>{output || 'No output yet. Click "Run Canvas" to execute the pipeline.'}</pre>
        </Paper>
      </Box>
    </Box>
  );
};

export default CanvasPreview; 