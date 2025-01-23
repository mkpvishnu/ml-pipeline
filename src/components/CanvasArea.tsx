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
      version: 'v1',
      code: `from clickhouse_driver import Client

def fetch_tickets():
    client = Client(
        host='clickhouse.example.com',
        port=9000,
        user='ml_pipeline',
        password='${process.env.CH_PASSWORD}'
    )
    
    query = """
    SELECT 
        ticket_id,
        title,
        description,
        created_at
    FROM tickets.new_tickets
    WHERE processed = false
    LIMIT 10000
    """
    
    return client.execute(query)`,
    },
  },
  {
    id: 'preprocess-1',
    type: 'moduleNode',
    position: { x: 400, y: 100 },
    data: {
      label: 'Preprocessing',
      version: 'v1',
      code: `import spacy
from transformers import GPT2TokenizerFast

nlp = spacy.load('en_core_web_sm')
tokenizer = GPT2TokenizerFast.from_pretrained('gpt2')

def preprocess_tickets(tickets):
    processed_tickets = []
    
    for ticket in tickets:
        # Check token length
        tokens = tokenizer.encode(ticket['description'])
        if len(tokens) > 20000:
            continue
            
        # Spam detection
        doc = nlp(ticket['description'].lower())
        spam_indicators = ['buy now', 'click here', 'limited time']
        if any(indicator in doc.text for indicator in spam_indicators):
            continue
            
        processed_tickets.append({
            'id': ticket['ticket_id'],
            'text': f"{ticket['title']} {ticket['description']}",
            'created_at': ticket['created_at']
        })
    
    return processed_tickets`,
    },
  },
  {
    id: 'training-1',
    type: 'moduleNode',
    position: { x: 700, y: 100 },
    data: {
      label: 'Training',
      version: 'v2',
      code: `from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from torch.utils.data import DataLoader, Dataset

tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
model = AutoModelForSequenceClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=5  # Number of ticket categories
)

def train_model(processed_tickets):
    # Prepare dataset
    texts = [t['text'] for t in processed_tickets]
    encodings = tokenizer(
        texts,
        truncation=True,
        padding=True,
        max_length=512,
        return_tensors='pt'
    )
    
    # Training loop
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
    model.train()
    
    for epoch in range(3):
        for batch in DataLoader(encodings, batch_size=16):
            outputs = model(**batch)
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()
    
    return model`,
    },
  },
  {
    id: 'validation-1',
    type: 'moduleNode',
    position: { x: 1000, y: 100 },
    data: {
      label: 'Validation',
      version: 'v1',
      code: `import pandas as pd
from sklearn.metrics import accuracy_score, classification_report

def validate_model(model, golden_dataset_path='s3://ml-models/golden-tickets.csv'):
    # Load golden dataset
    df = pd.read_csv(golden_dataset_path)
    
    # Prepare validation data
    texts = df['text'].tolist()
    true_labels = df['category'].tolist()
    
    # Model predictions
    encodings = tokenizer(
        texts,
        truncation=True,
        padding=True,
        max_length=512,
        return_tensors='pt'
    )
    
    with torch.no_grad():
        outputs = model(**encodings)
        predictions = torch.argmax(outputs.logits, dim=1)
    
    # Calculate metrics
    accuracy = accuracy_score(true_labels, predictions)
    report = classification_report(true_labels, predictions)
    
    return {
        'accuracy': accuracy,
        'report': report
    }`,
    },
  },
  {
    id: 'deployment-1',
    type: 'moduleNode',
    position: { x: 1300, y: 100 },
    data: {
      label: 'Deployment',
      version: 'v1',
      code: `import boto3
import kubernetes
from kubernetes import client, config

def deploy_model(model, validation_results):
    if validation_results['accuracy'] < 0.85:
        raise ValueError('Model accuracy below threshold')
    
    # Save model to S3
    s3 = boto3.client('s3')
    torch.save(model.state_dict(), '/tmp/model.pth')
    s3.upload_file(
        '/tmp/model.pth',
        'ml-models',
        'ticket-classifier/model.pth'
    )
    
    # Update K8s deployment
    config.load_kube_config()
    k8s_client = client.AppsV1Api()
    
    # Update the deployment with new model version
    deployment = k8s_client.read_namespaced_deployment(
        name='ticket-classifier',
        namespace='ml-services'
    )
    
    deployment.spec.template.spec.containers[0].image_pull_policy = 'Always'
    
    k8s_client.patch_namespaced_deployment(
        name='ticket-classifier',
        namespace='ml-services',
        body=deployment
    )
    
    return 'Deployment successful'`,
    },
  },
];

// Sample connections
const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'data-1', target: 'preprocess-1' },
  { id: 'e2-3', source: 'preprocess-1', target: 'training-1' },
  { id: 'e3-4', source: 'training-1', target: 'validation-1' },
  { id: 'e4-5', source: 'validation-1', target: 'deployment-1' },
];

const CanvasArea: React.FC = () => {
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
        data: { label: type, version: 'v1', code: '' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: 'background.default',
        p: 2,
      }}
    >
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
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default CanvasArea; 