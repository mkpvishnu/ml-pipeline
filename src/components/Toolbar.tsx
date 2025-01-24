import React, { useState } from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Button,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  Switch,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import ScheduleIcon from '@mui/icons-material/Schedule';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  onPreviewOpen: () => void;
}

const Toolbar: React.FC<Props> = ({ onPreviewOpen }) => {
  const [historyDialog, setHistoryDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);

  return (
    <>
      <AppBar 
        position="static" 
        color="default" 
        elevation={1}
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <MuiToolbar variant="dense">
          <Typography variant="h6" sx={{ mr: 2 }}>
            ML Pipeline Builder
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<PlayArrowIcon />}
              variant="contained"
              color="primary"
              size="small"
            >
              Run Pipeline
            </Button>

            <Button
              startIcon={<VisibilityIcon />}
              variant="outlined"
              size="small"
              onClick={onPreviewOpen}
            >
              Preview
            </Button>

            <Button
              startIcon={<HistoryIcon />}
              variant="outlined"
              size="small"
              onClick={() => setHistoryDialog(true)}
            >
              History
            </Button>

            <Button
              startIcon={<ScheduleIcon />}
              variant="outlined"
              size="small"
              onClick={() => setScheduleDialog(true)}
            >
              Schedule
            </Button>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Save">
              <IconButton size="small">
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Undo">
              <IconButton size="small">
                <UndoIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Redo">
              <IconButton size="small">
                <RedoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Share">
              <IconButton size="small">
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export">
              <IconButton size="small">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Clear Canvas">
              <IconButton size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Typography variant="body2" color="text.secondary">
            Demo Canvas: Ticket Classifier v1
          </Typography>
        </MuiToolbar>
      </AppBar>

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