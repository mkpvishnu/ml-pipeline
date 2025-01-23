import React, { useState } from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Menu,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Toolbar: React.FC = () => {
  const [newCanvasDialog, setNewCanvasDialog] = useState(false);
  const [newModuleDialog, setNewModuleDialog] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleNewCanvas = () => {
    setNewCanvasDialog(false);
    // TODO: Implement canvas creation
  };

  const handleNewModule = () => {
    setNewModuleDialog(false);
    // TODO: Implement module creation
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <MuiToolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Canvas</InputLabel>
              <Select label="Canvas" defaultValue="ticket-classifier">
                <MenuItem value="ticket-classifier">Ticket Classifier v1</MenuItem>
                <MenuItem value="new">
                  <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                  New Canvas
                </MenuItem>
              </Select>
            </FormControl>

            <Tooltip title="Create New Module">
              <IconButton onClick={() => setNewModuleDialog(true)} size="small">
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              size="small"
            >
              Save
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PlayArrowIcon />}
              size="small"
            >
              Run
            </Button>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              size="small"
              onClick={() => setHistoryDialog(true)}
            >
              History
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              size="small"
              onClick={() => setScheduleDialog(true)}
            >
              Schedule
            </Button>
          </Box>
        </MuiToolbar>
      </AppBar>

      {/* New Canvas Dialog */}
      <Dialog open={newCanvasDialog} onClose={() => setNewCanvasDialog(false)}>
        <DialogTitle>Create New Canvas</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Canvas Name"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCanvasDialog(false)}>Cancel</Button>
          <Button onClick={handleNewCanvas} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* New Module Dialog */}
      <Dialog open={newModuleDialog} onClose={() => setNewModuleDialog(false)}>
        <DialogTitle>Create New Module</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Module Name"
            fullWidth
            variant="outlined"
          />
          <TextField
            select
            margin="dense"
            label="Module Type"
            fullWidth
            variant="outlined"
          >
            <MenuItem value="data">Data Source</MenuItem>
            <MenuItem value="preprocess">Preprocessing</MenuItem>
            <MenuItem value="training">Training</MenuItem>
            <MenuItem value="validation">Validation</MenuItem>
            <MenuItem value="deployment">Deployment</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewModuleDialog(false)}>Cancel</Button>
          <Button onClick={handleNewModule} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog 
        open={historyDialog} 
        onClose={() => setHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Run History</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Sample Ticket Classifier History */}
            <Box sx={{ 
              p: 2, 
              mb: 2, 
              border: '1px solid', 
              borderColor: 'success.main',
              borderRadius: 1,
              bgcolor: 'success.light',
              color: 'success.contrastText'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <strong>Run #1234 - Success</strong>
                <span>2024-01-15 14:30:00</span>
              </Box>
              <Box sx={{ mb: 1 }}>
                <div>• Processed 1,500 new tickets</div>
                <div>• Filtered out 120 spam tickets</div>
                <div>• Training accuracy: 92.5%</div>
                <div>• Validation accuracy: 89.8%</div>
                <div>• Deployed to k8s cluster: prod-ml-01</div>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button size="small" variant="contained">View Details</Button>
                <Button size="small" variant="outlined">Download Logs</Button>
              </Box>
            </Box>

            <Box sx={{ 
              p: 2, 
              mb: 2, 
              border: '1px solid', 
              borderColor: 'error.main',
              borderRadius: 1,
              bgcolor: 'error.light',
              color: 'error.contrastText'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <strong>Run #1233 - Failed</strong>
                <span>2024-01-13 14:30:00</span>
              </Box>
              <Box sx={{ mb: 1 }}>
                <div>• Error in preprocessing module</div>
                <div>• Failed to connect to ClickHouse database</div>
                <div>• Pipeline execution stopped</div>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button size="small" variant="contained" color="error">View Error</Button>
                <Button size="small" variant="outlined">Download Logs</Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog 
        open={scheduleDialog} 
        onClose={() => setScheduleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Pipeline</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Frequency"
              defaultValue="2_days"
              margin="normal"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="2_days">Every 2 Days</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>

            <TextField
              type="time"
              fullWidth
              label="Start Time"
              defaultValue="02:00"
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: 'info.light', 
              borderRadius: 1,
              color: 'info.contrastText'
            }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Schedule:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>Runs every 2 days at 2:00 AM</li>
                <li>Next run: Jan 17, 2024 02:00 AM</li>
                <li>Last run: Jan 15, 2024 02:00 AM</li>
              </Box>
            </Box>

            <FormControl fullWidth margin="normal">
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Active"
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => {
              // TODO: Save schedule
              setScheduleDialog(false);
            }}
          >
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Toolbar; 