import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ModulePalette from './components/ModulePalette';
import CanvasArea from './components/CanvasArea';
import Toolbar from './components/Toolbar';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <ModulePalette />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Toolbar />
          <CanvasArea />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App; 