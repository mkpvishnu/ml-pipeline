import React from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import ScheduleIcon from '@mui/icons-material/Schedule';

const Toolbar: React.FC = () => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <MuiToolbar>
        <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>Canvas</InputLabel>
          <Select label="Canvas" defaultValue="1">
            <MenuItem value="1">Canvas v1</MenuItem>
            <MenuItem value="2">Canvas v2</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
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
          >
            History
          </Button>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            size="small"
          >
            Schedule
          </Button>
        </Box>
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar; 