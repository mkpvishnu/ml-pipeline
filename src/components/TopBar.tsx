import React, { useState } from 'react';
import { 
  FiPlay, 
  FiSave, 
  FiFolderPlus, 
  FiGrid, 
  FiBox,
  FiMoreVertical 
} from 'react-icons/fi';
import useStore from '../store';
import api from '../services/api';
import CreateDrawer from './CreateDrawer';
import './TopBar.css';
import logo from '../images/logo.png';

const TopBar: React.FC = () => {
  const { currentCanvas, setLoading } = useStore();
  const [createType, setCreateType] = useState<'group' | 'canvas' | 'module' | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleSaveCanvas = async () => {
    if (!currentCanvas) return;

    setLoading('saveCanvas', true);
    try {
      await api.canvas.update(currentCanvas.id, {
        module_config: currentCanvas.module_config
      });
    } finally {
      setLoading('saveCanvas', false);
    }
  };

  const handleRunCanvas = async () => {
    if (!currentCanvas) return;

    setLoading('runCanvas', true);
    try {
      await api.canvas.run(currentCanvas.id);
    } finally {
      setLoading('runCanvas', false);
    }
  };

  return (
    <div className="top-bar">
      <div className="left-actions">
        <img src={logo} alt="Freddy" height={32} /> <span className='product-name'>Freshflow</span>
        {/* <div className="action-group">
          <button 
            className="btn btn-icon tooltip-wrapper" 
            onClick={() => setCreateType('group')}
          >
            <FiFolderPlus className="icon" />
            <span className="tooltip-text">New Group</span>
          </button>
          <button 
            className="btn btn-icon tooltip-wrapper" 
            onClick={() => setCreateType('canvas')}
          >
            <FiGrid className="icon" />
            <span className="tooltip-text">New Canvas</span>
          </button>
          <button 
            className="btn btn-icon tooltip-wrapper" 
            onClick={() => setCreateType('module')}
          >
            <FiBox className="icon" />
            <span className="tooltip-text">New Module</span>
          </button>
        </div> */}
      </div>

      <div className="canvas-actions">
        {currentCanvas && (
          <>
            <button 
              className="btn btn-icon tooltip-wrapper" 
              onClick={handleSaveCanvas}
            >
              <FiSave className="icon" />
              <span className="tooltip-text">Save Canvas</span>
            </button>
            <button 
              className="btn btn-icon btn-primary tooltip-wrapper" 
              onClick={handleRunCanvas}
            >
              <FiPlay className="icon" />
              <span className="tooltip-text">Run Canvas</span>
            </button>
          </>
        )}
      </div>

      {createType && (
        <CreateDrawer 
          type={createType} 
          onClose={() => setCreateType(null)} 
        />
      )}
    </div>
  );
};

export default TopBar; 