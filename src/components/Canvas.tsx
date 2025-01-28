import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  NodeTypes,
  XYPosition,
  ReactFlowInstance,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import useStore from '../store';
import api from '../services/api';
import CustomNode from './CustomNode';
import NodeSettings from './NodeSettings';
import CanvasSettings from './CanvasSettings';
import './Canvas.css';

interface NodeData {
  moduleId: string;
  name?: string;
  description?: string;
  user_config?: Record<string, any>;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode
};

const CanvasFlow: React.FC = () => {
  const { currentCanvas, updateCanvas } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<{ id: string; moduleId: string } | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    try {
      const moduleId = event.dataTransfer.getData('moduleId');
      const moduleData = JSON.parse(event.dataTransfer.getData('moduleData'));
      
      if (!moduleId || !reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });

      const newNode: Node<NodeData> = {
        id: `${moduleId}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          moduleId,
          name: moduleData.name,
          description: moduleData.description,
          user_config: moduleData.user_config || {}
        }
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNode({ id: newNode.id, moduleId });
    } catch (err) {
      console.error('Error creating node:', err);
    }
  }, [reactFlowInstance, setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleNodeSave = useCallback((nodeId: string, config: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                name: config.name,
                description: config.description,
                user_config: config.user_config
              }
            }
          : node
      )
    );

    if (currentCanvas) {
      const updatedConfig = {
        nodes: nodes.map(node =>
          node.id === nodeId
            ? {
                id: node.id,
                type: node.type || 'custom',
                position: node.position,
                data: {
                  ...node.data,
                  name: config.name,
                  description: config.description,
                  user_config: config.user_config
                }
              }
            : {
                id: node.id,
                type: node.type || 'custom',
                position: node.position,
                data: node.data
              }
        ),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type
        }))
      };

      api.canvas.updateConfig(currentCanvas.id, updatedConfig)
        .then(() => {
          updateCanvas(currentCanvas.id, { module_config: updatedConfig });
        })
        .catch((err) => {
          console.error('Error updating canvas:', err);
        });
    }
  }, [nodes, edges, currentCanvas, updateCanvas]);

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    if (currentCanvas) {
      const updatedConfig = {
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type || 'custom',
          position: n.position,
          data: n.data,
          style: n.style
        })),
        edges
      };

      api.canvas.updateConfig(currentCanvas.id, updatedConfig)
        .then(() => {
          updateCanvas(currentCanvas.id, { module_config: updatedConfig });
        })
        .catch((err) => {
          console.error('Error updating canvas:', err);
        });
    }
  }, [nodes, edges, currentCanvas, updateCanvas]);

  const onNodeResize = useCallback((event: MouseEvent, node: Node<NodeData>) => {
    const updatedNodes = nodes.map(n => {
      if (n.id === node.id) {
        const style = {
          width: typeof node.width === 'number' ? node.width : undefined,
          height: typeof node.height === 'number' ? node.height : undefined
        };
        return {
          ...n,
          style
        };
      }
      return n;
    });

    setNodes(updatedNodes as Node<NodeData>[]);

    // Update canvas config after resize
    if (currentCanvas) {
      const updatedConfig = {
        nodes: updatedNodes.map(n => ({
          id: n.id,
          type: n.type || 'custom',
          position: n.position,
          data: n.data,
          style: n.style
        })),
        edges
      };

      api.canvas.updateConfig(currentCanvas.id, updatedConfig)
        .then(() => {
          updateCanvas(currentCanvas.id, { module_config: updatedConfig });
        })
        .catch((err) => {
          console.error('Error updating canvas:', err);
        });
    }
  }, [nodes, edges, currentCanvas, updateCanvas]);

  // Add onNodeClick handler to select nodes
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode({ id: node.id, moduleId: node.data.moduleId });
  }, []);

  return (
    <div className="canvas-wrapper">
      <div className="canvas-container" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          snapToGrid
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#666', strokeWidth: 2 }
          }}
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
      </div>

      {currentCanvas && (
        <CanvasSettings canvasId={currentCanvas.id} />
      )}

      {selectedNode && (
        <NodeSettings
          nodeId={selectedNode.id}
          moduleId={selectedNode.moduleId}
          onClose={() => setSelectedNode(null)}
          onSave={(config) => {
            handleNodeSave(selectedNode.id, config);
            setSelectedNode(null);
          }}
        />
      )}
    </div>
  );
};

// Wrap the component with ReactFlowProvider
const Canvas: React.FC = () => (
  <ReactFlowProvider>
    <CanvasFlow />
  </ReactFlowProvider>
);

export default Canvas; 