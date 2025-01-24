import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ModulePalette from './components/ModulePalette';
import CanvasArea from './components/CanvasArea';
import Toolbar from './components/Toolbar';
import ComponentDrawer from './components/ComponentDrawer';
import CanvasPreview from './components/CanvasPreview';

const COMPONENT_DRAWER_WIDTH = 400;
const PREVIEW_DRAWER_WIDTH = 500;
const MODULE_PALETTE_WIDTH = 280;

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
        position: 'relative',
      }}>
        {/* Left Sidebar - Module Palette */}
        <Box sx={{ 
          width: MODULE_PALETTE_WIDTH,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          zIndex: 1,
          bgcolor: 'background.paper',
          position: 'relative',
        }}>
          <ModulePalette />
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 0,
        }}>
          <Toolbar 
            onPreviewOpen={() => setIsPreviewOpen(true)}
          />
          <Box sx={{ 
            flex: 1,
            position: 'relative',
            bgcolor: 'background.default',
          }}>
            <CanvasArea 
              onComponentSelect={handleComponentSelect}
            />
          </Box>
        </Box>

        {/* Right Sidebars Container */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          display: 'flex',
          zIndex: 2,
          pointerEvents: 'none', // This allows clicking through the container when drawers are closed
        }}>
          {/* Component Settings Drawer */}
          <Box sx={{ 
            height: '100%',
            pointerEvents: isComponentDrawerOpen ? 'auto' : 'none',
          }}>
            {selectedComponent && (
              <ComponentDrawer
                open={isComponentDrawerOpen}
                onClose={() => setIsComponentDrawerOpen(false)}
                componentId={selectedComponent.id}
                componentType={selectedComponent.type}
              />
            )}
          </Box>

          {/* Preview Drawer */}
          <Box sx={{ 
            height: '100%',
            pointerEvents: isPreviewOpen ? 'auto' : 'none',
          }}>
            <CanvasPreview
              open={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App; 