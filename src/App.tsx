import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ModulePalette from './components/ModulePalette';
import CanvasArea from './components/CanvasArea';
import Toolbar from './components/Toolbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        overflow: 'hidden',
        bgcolor: 'background.default' 
      }}>
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