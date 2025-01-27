import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import useStore from '../store';
import api from '../services/api';
import CustomNode from './CustomNode';
import './Canvas.css';

const nodeTypes = {
  custom: CustomNode,
};

const Canvas: React.FC = () => {
  const { currentCanvas, updateCanvas } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const moduleId = event.dataTransfer.getData('moduleId');
    if (!moduleId) return;

    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    };

    const newNode: Node = {
      id: `${moduleId}-${Date.now()}`,
      type: 'custom',
      position,
      data: { moduleId }
    };

    setNodes((nds) => [...nds, newNode]);

    if (currentCanvas) {
      const updatedConfig = {
        nodes: [...nodes, newNode],
        edges
      };
      api.canvas.updateConfig(currentCanvas.id, updatedConfig)
        .then(() => {
          updateCanvas(currentCanvas.id, { module_config: updatedConfig });
        })
        .catch((err) => {
          console.error('Error updating canvas:', err);
          setNodes((nds) => nds.filter(n => n.id !== newNode.id));
        });
    }
  }, [nodes, edges, currentCanvas, updateCanvas]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#444"
        />
        <Controls />
      </ReactFlow>

      <style jsx>{`
        .canvas {
          flex: 1;
          background-color: var(--background-primary);
        }

        :global(.react-flow__node) {
          border-radius: 4px;
          border: 1px solid var(--border-light);
          background-color: var(--background-secondary);
          padding: 8px;
        }

        :global(.react-flow__handle) {
          width: 8px;
          height: 8px;
          background-color: var(--accent-primary);
          border: 2px solid var(--background-secondary);
        }

        :global(.react-flow__edge-path) {
          stroke: var(--border-medium);
          stroke-width: 2;
        }

        :global(.react-flow__controls) {
          background-color: var(--background-secondary);
          border: 1px solid var(--border-light);
          border-radius: 4px;
          box-shadow: var(--shadow-small);
        }

        :global(.react-flow__controls-button) {
          background-color: var(--background-tertiary);
          border-bottom: 1px solid var(--border-light);
          color: var(--text-secondary);
        }

        :global(.react-flow__controls-button:hover) {
          background-color: var(--background-secondary);
        }
      `}</style>
    </div>
  );
};

export default Canvas; 