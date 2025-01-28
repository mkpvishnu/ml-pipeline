import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { FiSettings } from 'react-icons/fi';
import './CustomNode.css';

interface CustomNodeProps {
  id: string;
  data: {
    moduleId: string;
    name?: string;
    description?: string;
    user_config?: Record<string, any>;
  };
  selected?: boolean;
  onSettingsClick?: () => void;
}

const CustomNode: React.FC<CustomNodeProps> = ({ 
  id,
  data, 
  selected = false,
  onSettingsClick 
}) => {
  const onResizeStart = useCallback(() => {
    // Add any resize start logic here
  }, []);

  const onResize = useCallback(() => {
    // Add any resize logic here
  }, []);

  const onResizeEnd = useCallback(() => {
    // Add any resize end logic here
  }, []);

  return (
    <>
      <NodeResizer
        minWidth={150}
        minHeight={40}
        isVisible={selected}
        lineClassName="noderesize-line"
        handleClassName="noderesize-handle"
        onResizeStart={onResizeStart}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
      />
      
      <div className={`custom-node ${selected ? 'selected' : ''}`}>
        <Handle
          type="target"
          position={Position.Left}
          style={{ backgroundColor: '#0066cc', border: '2px solid white' }}
        />
        
        <div className="node-content">
          <div className="node-header">
            <span className="node-title">{data.name || 'New Node'}</span>
            <button className="node-settings-btn" onClick={onSettingsClick}>
              <FiSettings />
            </button>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          style={{ backgroundColor: '#0066cc', border: '2px solid white' }}
        />
      </div>
    </>
  );
};

export default memo(CustomNode); 