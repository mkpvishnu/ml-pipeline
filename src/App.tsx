import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import useStore from './store';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import Canvas from './components/Canvas';
import RightDrawer from './components/RightDrawer';
import BottomPanel from './components/BottomPanel';
import 'reactflow/dist/style.css';
import './styles/variables.css';
import './styles/global.css';

const App: React.FC = () => {
  const { 
    isSettingsOpen, 
    selectedModuleId,
    isBottomPanelExpanded 
  } = useStore();

  return (
    <div className="app-container">
      <TopBar />
      <div className="main-content">
        <LeftSidebar />
        <div className="canvas-container">
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </div>
        {isSettingsOpen && selectedModuleId && (
          <RightDrawer 
            moduleId={selectedModuleId} 
          />
        )}
      </div>
      <BottomPanel 
        expanded={isBottomPanelExpanded} 
      />
    </div>
  );
};

export default App; 