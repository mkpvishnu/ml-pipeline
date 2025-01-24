import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import ModuleNode from './ModuleNode';
import { Box } from '@mui/material';

interface Props {
  onComponentSelect: (componentId: string, componentType: string) => void;
}

const nodeTypes = {
  moduleNode: ModuleNode,
};

// Sample ticket classifier pipeline nodes
const initialNodes: Node[] = [
  {
    id: 'data-1',
    type: 'moduleNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Data Source',
      componentType: 'data_loader',
      activeModule: {
        id: 'csv-loader',
        name: 'CSV Loader',
        type: 'default'
      },
      onSettingsOpen: () => {},
    },
  },
  {
    id: 'preprocess-1',
    type: 'moduleNode',
    position: { x: 400, y: 100 },
    data: {
      label: 'Preprocessing',
      componentType: 'data_transformer',
      activeModule: {
        id: 'basic-transformer',
        name: 'Basic Transformer',
        type: 'default'
      },
      onSettingsOpen: () => {},
    },
  },
  {
    id: 'training-1',
    type: 'moduleNode',
    position: { x: 700, y: 100 },
    data: {
      label: 'Classifier',
      componentType: 'classifier',
      activeModule: {
        id: 'bert-classifier',
        name: 'BERT Classifier',
        type: 'default'
      },
      onSettingsOpen: () => {},
    },
  },
  {
    id: 'validation-1',
    type: 'moduleNode',
    position: { x: 1000, y: 100 },
    data: {
      label: 'Model Evaluator',
      componentType: 'evaluator',
      activeModule: {
        id: 'basic-evaluator',
        name: 'Basic Evaluator',
        type: 'default'
      },
      onSettingsOpen: () => {},
    },
  },
];

// Sample connections
const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'data-1', target: 'preprocess-1' },
  { id: 'e2-3', source: 'preprocess-1', target: 'training-1' },
  { id: 'e3-4', source: 'training-1', target: 'validation-1' },
];

const CanvasArea: React.FC<Props> = ({ onComponentSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const position = {
        x: event.clientX - 240,
        y: event.clientY - 64,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'moduleNode',
        position,
        data: { 
          label: type, 
          componentType: type,
          onSettingsOpen: () => onComponentSelect(`${type}-${Date.now()}`, type),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, onComponentSelect]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    onComponentSelect(node.id, node.data.componentType);
  };

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      '& .react-flow__renderer': {
        bgcolor: 'background.default',
      },
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default CanvasArea; 