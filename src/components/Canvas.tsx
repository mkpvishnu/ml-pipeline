import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Node,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  NodeTypes,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useStore from '../store';
import CustomNode from './CustomNode';
import NodeSettings from './NodeSettings';
// import CanvasSettings from './CanvasSettings';
import './Canvas.css';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { useApiRender } from '../context/ApiRenderContext';

interface NodeData {
  moduleId: string;
  name?: string;
  description?: string;
  user_config?: Record<string, any>;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode
};

const CanvasFlow: React.FC = ({canvasId, setCanvasId, tabValue, setTabValue}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<{ id: string; moduleId: string } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const { setShouldRerender } = useApiRender();

  useEffect(() => {
    if (!canvasId) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    } else {
      fetch(`https://freddy-ml-pipeline-test.cxbu.staging.freddyproject.com/api/v1/canvas/${canvasId}`, {
        headers: {
          'Content-Type': 'application/json',
          'account-id': 2,
          accept: 'application/json',
        },
      }).then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setCanvasId(data.id);
        setNodes(data.module_config.nodes.map(n => ({...n, selected: false}) ));
        setEdges(data.module_config.edges);
        setSelectedNode(null);
        setViewport({ x: 400, y: 100, zoom: 1 }, { duration: 100 });
        // On Canvas  save, create the canvas. Move to Canvas tab.
        setTabValue(0);
      }).catch((error) => {
        console.error('Error:', error);
      });
    }
  }, [canvasId]);

  const { screenToFlowPosition, setViewport } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    try {
      const moduleId = event.dataTransfer.getData('moduleId');
      const groupId = event.dataTransfer.getData('groupId');
      const moduleData = JSON.parse(event.dataTransfer.getData('moduleData'));

      if (!moduleId || !reactFlowWrapper.current) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: moduleId,
        position,
        data: {
          label: moduleData.name,
          moduleId,
          // name: moduleData.name,
          moduleData,
          groupId
        }
      };
 
      setNodes((nds) => nds.concat(newNode));
      setSelectedNode({ id: newNode.id, group_id: groupId });
    } catch (err) {
      console.error('Error creating node:', err);
    }
  }, [screenToFlowPosition]);

  // Add onNodeClick handler to select nodes
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode({ id: node.id, group_id: node.data.group_id  });
  }, []);

  const handleNodeSave = (node) => {
    console.log({ node, nodes, edges });
    fetch(`https://freddy-ml-pipeline-test.cxbu.staging.freddyproject.com/api/v1/modules/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'group-id': node.group_id,
        'account-id': 2,
        accept: 'application/json',
      },
      body: JSON.stringify(node)
    }).then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // once save, replace the above response id to sync the selected node
      const updatedNodes = nodes.map((n) => {
        if (n.id === data.parent_module_id) {
          return {...n, id: String(data.id), data: { ...data, label: data.name }};
        }
        return n;
      });
      setNodes(updatedNodes);
      const updatedEdges = edges.map((e) => {
        if (e.source === data.parent_module_id) {
          return { ...e, source: String(data.id) };
        }
        return e;
      });
      setEdges(updatedEdges);
      setSelectedNode(null);
      setShouldRerender(prev => !prev);
      // Left side bar updates under modules tab if its focussed
    }).catch((error) => {
      console.error('Error:', error);
    });
  }

  const onSaveCanvas = () => {
    const randomTwoDigit = () => Math.floor(10 + Math.random() * 90);
    const payload = {
      name: `Canvas ${randomTwoDigit()}`,
      description: '',
      module_config: {nodes, edges}
    }
    console.log({ canvasId, payload });
    fetch(`https://freddy-ml-pipeline-test.cxbu.staging.freddyproject.com/api/v1/canvas/${canvasId || ''}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'account-id': 2,
        accept: 'application/json',
      },
      body: JSON.stringify(payload)
    }).then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      setCanvasId(data.id);
      setNodes(data.module_config.nodes.map(n => ({...n, selected: false}) ));
      setEdges(data.module_config.edges);
      setSelectedNode(null);
      setViewport({ x: 400, y: 100, zoom: 1 }, { duration: 100 });
      // On Canvas  save, create the canvas. Move to Canvas tab.
      setTabValue(1);
    }).catch((error) => {
      console.error('Error:', error);
    });
    // On clicking of it, it should show the nodes with their configuration. - YET TO PICK
    // Existing module config can be updated. - DONE
    // To drag new module, click on module tab to drop the modules on existing canvas - DONE
  }

  const onNewCanvas = () => {
    setCanvasId('');
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setTabValue(0);
  }

  const onResetCanvas = () => {
    // fetch canvas to populate nodes and edges
    console.log('fetch canvas to populate nodes and edges', {canvasId});
  }

  // console.log({ nodes, selectedNode });
  
  return (
    <>
      <div className='node-save'>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={1}>
            {canvasId ? <Button size="small" variant="outlined" onClick={onNewCanvas}>New</Button> : null}
            {canvasId ? <Button size="small" variant="outlined" onClick={onResetCanvas}>Reset</Button> : null}
            <Button size="small" variant="contained" onClick={onSaveCanvas}>Save</Button>
          </Grid>
        </Box>
      </div>
      <div className="canvas-wrapper">
        <div className="canvas-container" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            style={{ backgroundColor: "#F7F9FB" }}
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

        {/* {currentCanvas && (
          <CanvasSettings canvasId={currentCanvas.id} />
        )} */}

        {selectedNode && (
          <NodeSettings
            nodeId={selectedNode.id}
            onClose={() => setSelectedNode(null)}
            nodes={nodes}
            edges={edges}
            handleNodeSave={handleNodeSave}
          />
        )}
    </div>
    </>
  );
};

// Wrap the component with ReactFlowProvider
const Canvas: React.FC = (props) => (
  <ReactFlowProvider>
    <CanvasFlow {...props} />
  </ReactFlowProvider>
);

export default Canvas; 