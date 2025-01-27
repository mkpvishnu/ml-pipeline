import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import useStore from '../store';
import api from '../services/api';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const Canvas: React.FC = () => {
  const { currentCanvas, setSelectedModule, setLoading } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      const moduleId = event.dataTransfer.getData('moduleId');
      if (!moduleId) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      setLoading('createCustomModule', true);
      try {
        // Create custom module from the dropped one
        const response = await api.modules.create(moduleId, {
          parent_module_id: moduleId,
          scope: 'account'
        });

        const newNode = {
          id: response.data.id,
          type: 'custom',
          position,
          data: {
            label: response.data.name,
            config: response.data.user_config,
          },
        };

        setNodes((nds) => [...nds, newNode]);
      } finally {
        setLoading('createCustomModule', false);
      }
    },
    [setNodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedModule(node.id);
    },
    [setSelectedModule]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
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