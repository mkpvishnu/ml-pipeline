import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ModulePalette from './components/ModulePalette';
import CanvasArea from './components/CanvasArea';
import Toolbar from './components/Toolbar';
import ComponentDrawer from './components/ComponentDrawer';
import CanvasPreview from './components/CanvasPreview';

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
  const [selectedComponent, setSelectedComponent] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [isComponentDrawerOpen, setIsComponentDrawerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleComponentSelect = (componentId: string, componentType: string) => {
    setSelectedComponent({ id: componentId, type: componentType });
    setIsComponentDrawerOpen(true);
  };

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
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          marginRight: isComponentDrawerOpen ? '400px' : 0,
          marginLeft: 0,
          transition: 'margin 0.3s ease-in-out',
        }}>
          <Toolbar 
            onPreviewOpen={() => setIsPreviewOpen(true)}
          />
          <CanvasArea 
            onComponentSelect={handleComponentSelect}
          />
        </Box>
        
        {selectedComponent && (
          <ComponentDrawer
            open={isComponentDrawerOpen}
            onClose={() => setIsComponentDrawerOpen(false)}
            componentId={selectedComponent.id}
            componentType={selectedComponent.type}
          />
        )}

        <CanvasPreview
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default App; 