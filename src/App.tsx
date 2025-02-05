import React, { useState } from 'react';
import useStore from './store';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import Canvas from './components/Canvas';
import RightDrawer from './components/RightDrawer';
import BottomPanel from './components/BottomPanel';
import './styles/variables.css';
import './styles/global.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ApiRenderProvider } from './context/ApiRenderContext';

const App: React.FC = () => {
  const { 
    // isSettingsOpen, 
    // selectedModuleId,
    isBottomPanelExpanded 
  } = useStore();

  // provide a reset/clear button to clear the canvas
  const [canvasId, setCanvasId] =  useState('');
  const [tabValue, setTabValue] = useState(0);
  const [run, setRun] = useState(false);

  const props = {
    canvasId,
    setCanvasId,
    tabValue,
    setTabValue,
    run,
    setRun
  }

  return (
    <ApiRenderProvider>
      <div className="app-container">
        <TopBar />
        <div className="main-content">
          <LeftSidebar {...props} />
          <div className="canvas-container">
              <Canvas {...props} />
          </div>
          {/* {isSettingsOpen && selectedModuleId && (
            <RightDrawer 
              moduleId={selectedModuleId} 
            />
          )} */}
        </div>
        <BottomPanel 
          expanded={isBottomPanelExpanded} 
          run={run}
          canvasId={canvasId}
        />
      </div>
    </ApiRenderProvider>
  );
};

export default App; 