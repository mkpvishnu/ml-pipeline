import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FiSettings, FiPlay } from 'react-icons/fi';
import useStore from '../store';
import api from '../services/api';

interface CustomNodeProps {
  id: string;
  data: {
    label: string;
    config: Record<string, any>;
  };
}

const CustomNode: React.FC<CustomNodeProps> = ({ id, data }) => {
  const [showActions, setShowActions] = useState(false);
  const { setSelectedModule, setLoading } = useStore();

  const handleRunModule = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(`runModule-${id}`, true);
    try {
      await api.modules.run(id);
    } finally {
      setLoading(`runModule-${id}`, false);
    }
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedModule(id);
  };

  return (
    <div 
      className="custom-node"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Handle type="target" position={Position.Top} />
      
      <div className="node-content">
        <div className="node-header">
          <span className="node-label">{data.label}</span>
          {showActions && (
            <div className="node-actions fade-in">
              <button 
                className="btn btn-icon"
                onClick={handleSettings}
                title="Settings"
              >
                <FiSettings className="icon" />
              </button>
              <button 
                className="btn btn-icon"
                onClick={handleRunModule}
                title="Run Module"
              >
                <FiPlay className="icon" />
              </button>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />

      <style jsx>{`
        .custom-node {
          min-width: 150px;
        }

        .node-content {
          padding: 8px;
        }

        .node-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .node-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .node-actions {
          display: flex;
          gap: 4px;
        }

        .btn {
          padding: 4px;
          color: var(--text-secondary);
        }

        .btn:hover {
          color: var(--text-primary);
          background-color: var(--background-tertiary);
        }

        .icon {
          width: 14px;
          height: 14px;
        }
      `}</style>
    </div>
  );
};

export default CustomNode; 