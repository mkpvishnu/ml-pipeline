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
import { DOMAIN, ACCOUNT_ID } from '../constants/app';

interface NodeData {
  moduleId: string;
  name?: string;
  description?: string;
  user_config?: Record<string, any>;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode
};

const CanvasFlow: React.FC = ({canvasId, setCanvasId, tabValue, setTabValue, run, setRun, history}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<{ id: string; moduleId: string } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunLoading, setIsRunLoading] = useState(false);

  const { setShouldRerender } = useApiRender();

  const { screenToFlowPosition, fitView, setCenter } = useReactFlow();

  const fetchCanvas = () => {
    fetch(`${DOMAIN}/api/v1/canvas/${canvasId}`, {
      headers: {
        'Content-Type': 'application/json',
        'account-id': ACCOUNT_ID,
        accept: 'application/json',
      },
    }).then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // setCanvasId(data.id);
      setEdges(data.module_config.edges);
      const updatedNodes = data.module_config.nodes.map(n => ({
        ...n, 
        data: {
          ...n.data, 
          label: (
            <div className='node-parent'>
              <p className='node-parent-name'>{n.data.moduleData?.name || n.data.name}</p>
              <p className='node-state published'>{n.data.moduleData?.status || n.data.status}</p>
            </div>
          )
        }, 
        selected: false
      }))
      setNodes(updatedNodes);
      // console.log({ updatedNodes });
      
      setSelectedNode(null);
      // if (updatedNodes.length > 0) {
      //   const node = updatedNodes[0]; // Adjust this for multiple nodes
      //   console.log({ node });
        
      //   setCenter(node.position.x, node.position.y, { zoom: 1.5 });
      //   fitView({ padding: 0.2, duration: 5000 });
      // }
      // On Canvas  save, create the canvas. Move to Canvas tab.
      setTabValue(0);
    }).catch((error) => {
      console.error('Error:', error);
    });
  }

  useEffect(() => {
    if (!canvasId) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    } else {
      fetchCanvas();
    }
  }, [canvasId]);

  // [
  //   "vector_store: WAITING",
  //   "s3_downloader: COMPLETED",
  //   "document_processor: FAILED",
  //   "embeddings_generator: WAITING",
  //   "document_preprocessor: WAITING"
  // ]

  useEffect(() => {
    if (run && canvasId && history.length) {
      // get the history
      // preselect the node based on status and its name
      // show the state of all the nodes
      console.log({ nodes, history });
      setNodes((prevItems) =>
        prevItems.map((item) => ({
          ...item, 
          data: {
            ...item.data,
            label: (
             <div className='node-parent'>
               <p className='node-parent-name'>{item.data?.name}</p>
               <p className='node-state published'>{item.data.status}</p>
               <p className='node-workflow-status'>{history.find(h => h.split('---->')[0].trim() === item.data.name)?.split(':')[1]}</p>
             </div>
            ) 
         }
        }))
      );
    }
  }, [run, canvasId, history])

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
          label: (
            <div className='node-parent'>
              <p className='node-parent-name'>{moduleData.name}</p>
              <p className={`node-state ${moduleData.status}`}>{moduleData.status}</p>
            </div>
          ),
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
    // console.log({ node, nodes, edges });
    const IS_CUSTOM = node.type === 'custom';
    setIsLoading(true);
    fetch(`${DOMAIN}/api/v1/modules/${IS_CUSTOM ? node.id : 'custom'}`, {
      method: IS_CUSTOM ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'group-id': node.group_id,
        'account-id': ACCOUNT_ID,
        accept: 'application/json',
        ...(IS_CUSTOM ? {} : { "module-id": node.id })
      },
      body: JSON.stringify({
        ...node,
        "parent_module_id": 0
      })
    }).then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // once save, replace the above response id to sync the selected node
      const updatedNodes = nodes.map((n) => {
        if (!IS_CUSTOM && (n.id == data.parent_module_id)) {
          return {
            ...n, 
            id: String(data.id),
            data: { 
              ...data, 
              label: (
                <div className='node-parent'>
                  <p className='node-parent-name'>{data.name}</p>
                  <p className='node-state published'>{data.status}</p>
                </div>
              ) 
            }
          };
        } else if (IS_CUSTOM && (n.id == data.id)) {
          return { 
            ...n,
            data: { 
              ...data, 
              label:  (
                <div className='node-parent'>
                  <p className='node-parent-name'>{data.name}</p>
                  <p className='node-state published'>{data.status}</p>
                </div>
              ) 
            }
          }
        }
        return n;
      });
      setNodes(updatedNodes);
      let updatedEdges = edges;
      if (node.status === 'draft') {
        updatedEdges = edges.map((e) => {
          if (e.target == data.parent_module_id) {
            return { ...e, target: String(data.id) };
          }
          return e;
        })
      }
      // const updatedEdges = edges.map((e) => {
      //   if (e.source == data.parent_module_id) {
      //     return { ...e, source: String(data.id) };
      //   }
      //   return e;
      // });
      setEdges(updatedEdges);
      setSelectedNode(null);
      setShouldRerender(prev => !prev);
      // Left side bar updates under modules tab if its focussed
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      setIsLoading(false);
    });
  }

  const onSaveCanvas = () => {
    setIsLoading(true);
    const randomTwoDigit = () => Math.floor(10 + Math.random() * 90);
    const payload = {
      name: `Canvas ${randomTwoDigit()}`,
      description: '',
      module_config: {
        // n.data.moduleData.name first time from default its not present for new drag/drop
        // on click of canvas directly works for the below code (n.data.moduleData.name)
        nodes: nodes.map(n => ({...n, data: {...n.data, label: n.data.moduleData?.name || n.data.name }})), 
        edges
      }
    }
    // console.log({ canvasId, payload });
    fetch(`${DOMAIN}/api/v1/canvas/${canvasId || ''}`, {
      method: canvasId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'account-id': ACCOUNT_ID,
        accept: 'application/json',
      },
      body: JSON.stringify(payload)
    }).then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      setCanvasId(data.id);
      // setNodes(data.module_config.nodes.map(n => ({...n, data: {...n.data, label: <>{n.data.moduleData.name}</>}, selected: false}) ));
      setNodes(data.module_config.nodes.map(n => ({
        ...n, 
        data: {
          ...n.data, 
          label: (
            <div className='node-parent'>
              <p className='node-parent-name'>{n.data.name}</p>
              <p className='node-state published'>{n.data.status}</p>
            </div>
          )
        }, 
        selected: false
      })));
      setEdges(data.module_config.edges);
      setSelectedNode(null);
      // setViewport({ x: 400, y: 100, zoom: 1 }, { duration: 100 });
      // On Canvas  save, create the canvas. Move to Canvas tab.
      setTabValue(1);
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      setIsLoading(false)
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
    setRun('');
  }

  const onResetCanvas = () => {
    // fetch canvas to populate nodes and edges
    console.log('fetch canvas to populate nodes and edges', {canvasId});
    setRun('');
    fetchCanvas();
  }

  const onRunCanvas = () => {
    setIsRunLoading(true);
    fetch(`${DOMAIN}/api/v1/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'account-id': ACCOUNT_ID,
        accept: 'application/json',
        'canvas-id': canvasId
      },
    }).then(response => response.json())
    .then(data => {
      // ACTUAL
      // setRun(data.id);
      // TESTING
      setRun(data.workflow_id);
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      setIsRunLoading(false);
    });
  }

  // console.log({ nodes, edges, selectedNode });

  return (
    <>
      <div className='node-save'>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={1}>
            {canvasId ? <Button size="small" variant="outlined" onClick={onNewCanvas}>New</Button> : null}
            {canvasId ? <Button size="small" variant="outlined" onClick={onResetCanvas}>Reset</Button> : null}
            <Button size="small" variant="contained" onClick={onSaveCanvas} loading={isLoading}>{canvasId ? 'Update' : 'Save'}</Button>
            {canvasId ? <Button size="small" variant="outlined" onClick={onRunCanvas} disabled={isLoading} loading={isRunLoading} color="success">Run</Button> : null}
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
            groupId={selectedNode.group_id}
            onClose={() => setSelectedNode(null)}
            nodes={nodes}
            edges={edges}
            handleNodeSave={handleNodeSave}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
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