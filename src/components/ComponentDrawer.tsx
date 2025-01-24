import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  TextField,
  Paper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface Module {
  id: string;
  name: string;
  type: 'default' | 'custom';
  code: string;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  componentId: string;
  componentType: string;
}

const defaultModules: Record<string, Module[]> = {
  classifier: [
    {
      id: 'bert-classifier',
      name: 'BERT Classifier',
      type: 'default',
      code: 'from transformers import AutoModelForSequenceClassification\n\ndef classify(text):\n    model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased")\n    return model(text)',
      isActive: false,
    },
    {
      id: 'lstm-classifier',
      name: 'LSTM Classifier',
      type: 'default',
      code: 'import torch.nn as nn\n\nclass LSTMClassifier(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.lstm = nn.LSTM(input_size=100, hidden_size=64)\n        self.fc = nn.Linear(64, 2)',
      isActive: false,
    },
    {
      id: 'roberta-classifier',
      name: 'RoBERTa Classifier',
      type: 'default',
      code: 'from transformers import RobertaForSequenceClassification\n\ndef classify(text):\n    model = RobertaForSequenceClassification.from_pretrained("roberta-base")\n    return model(text)',
      isActive: false,
    },
    {
      id: 'distilbert-classifier',
      name: 'DistilBERT Classifier',
      type: 'default',
      code: 'from transformers import DistilBertForSequenceClassification\n\ndef classify(text):\n    model = DistilBertForSequenceClassification.from_pretrained("distilbert-base-uncased")\n    return model(text)',
      isActive: false,
    },
  ],
  data_loader: [
    {
      id: 'csv-loader',
      name: 'CSV Loader',
      type: 'default',
      code: 'import pandas as pd\n\ndef load_data(path):\n    return pd.read_csv(path)',
      isActive: false,
    },
    {
      id: 'json-loader',
      name: 'JSON Loader',
      type: 'default',
      code: 'import json\n\ndef load_data(path):\n    with open(path, "r") as f:\n        return json.load(f)',
      isActive: false,
    },
    {
      id: 'sql-loader',
      name: 'SQL Loader',
      type: 'default',
      code: 'import sqlalchemy as sa\n\ndef load_data(connection_string, query):\n    engine = sa.create_engine(connection_string)\n    with engine.connect() as conn:\n        return pd.read_sql(query, conn)',
      isActive: false,
    },
    {
      id: 'parquet-loader',
      name: 'Parquet Loader',
      type: 'default',
      code: 'import pandas as pd\n\ndef load_data(path):\n    return pd.read_parquet(path)',
      isActive: false,
    },
  ],
  data_transformer: [
    {
      id: 'text-preprocessor',
      name: 'Text Preprocessor',
      type: 'default',
      code: 'import re\nimport nltk\nfrom nltk.tokenize import word_tokenize\nfrom nltk.corpus import stopwords\n\ndef preprocess_text(text):\n    text = text.lower()\n    text = re.sub(r"[^\\w\\s]", "", text)\n    tokens = word_tokenize(text)\n    stop_words = set(stopwords.words("english"))\n    tokens = [t for t in tokens if t not in stop_words]\n    return " ".join(tokens)',
      isActive: false,
    },
    {
      id: 'numeric-scaler',
      name: 'Numeric Scaler',
      type: 'default',
      code: 'from sklearn.preprocessing import StandardScaler\n\ndef scale_features(data):\n    scaler = StandardScaler()\n    return scaler.fit_transform(data)',
      isActive: false,
    },
    {
      id: 'categorical-encoder',
      name: 'Categorical Encoder',
      type: 'default',
      code: 'from sklearn.preprocessing import LabelEncoder\n\ndef encode_categories(data):\n    encoder = LabelEncoder()\n    return encoder.fit_transform(data)',
      isActive: false,
    },
  ],
  evaluator: [
    {
      id: 'classification-metrics',
      name: 'Classification Metrics',
      type: 'default',
      code: 'from sklearn.metrics import accuracy_score, precision_recall_fscore_support\n\ndef evaluate(y_true, y_pred):\n    accuracy = accuracy_score(y_true, y_pred)\n    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted")\n    return {\n        "accuracy": accuracy,\n        "precision": precision,\n        "recall": recall,\n        "f1": f1\n    }',
      isActive: false,
    },
    {
      id: 'confusion-matrix',
      name: 'Confusion Matrix',
      type: 'default',
      code: 'import seaborn as sns\nimport matplotlib.pyplot as plt\nfrom sklearn.metrics import confusion_matrix\n\ndef plot_confusion_matrix(y_true, y_pred, labels=None):\n    cm = confusion_matrix(y_true, y_pred)\n    plt.figure(figsize=(10, 8))\n    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels)\n    plt.title("Confusion Matrix")\n    plt.ylabel("True Label")\n    plt.xlabel("Predicted Label")\n    return plt',
      isActive: false,
    },
    {
      id: 'roc-curve',
      name: 'ROC Curve',
      type: 'default',
      code: 'from sklearn.metrics import roc_curve, auc\nimport matplotlib.pyplot as plt\n\ndef plot_roc_curve(y_true, y_prob):\n    fpr, tpr, _ = roc_curve(y_true, y_prob)\n    roc_auc = auc(fpr, tpr)\n    plt.figure()\n    plt.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC curve (AUC = {roc_auc:.2f})")\n    plt.plot([0, 1], [0, 1], color="navy", lw=2, linestyle="--")\n    plt.xlim([0.0, 1.0])\n    plt.ylim([0.0, 1.05])\n    plt.xlabel("False Positive Rate")\n    plt.ylabel("True Positive Rate")\n    plt.title("Receiver Operating Characteristic")\n    plt.legend(loc="lower right")\n    return plt',
      isActive: false,
    },
  ],
  model_server: [
    {
      id: 'fastapi-server',
      name: 'FastAPI Server',
      type: 'default',
      code: 'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass PredictionRequest(BaseModel):\n    text: str\n\n@app.post("/predict")\ndef predict(request: PredictionRequest):\n    result = model.predict([request.text])[0]\n    return {"prediction": result}',
      isActive: false,
    },
    {
      id: 'flask-server',
      name: 'Flask Server',
      type: 'default',
      code: 'from flask import Flask, request, jsonify\n\napp = Flask(__name__)\n\n@app.route("/predict", methods=["POST"])\ndef predict():\n    data = request.json\n    result = model.predict([data["text"]])[0]\n    return jsonify({"prediction": result})',
      isActive: false,
    },
    {
      id: 'grpc-server',
      name: 'gRPC Server',
      type: 'default',
      code: 'import grpc\nfrom concurrent import futures\n\nclass PredictionService(prediction_pb2_grpc.PredictionServicer):\n    def Predict(self, request, context):\n        result = model.predict([request.text])[0]\n        return prediction_pb2.PredictionResponse(prediction=result)\n\ndef serve():\n    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))\n    prediction_pb2_grpc.add_PredictionServicer_to_server(PredictionService(), server)\n    server.add_insecure_port("[::]:50051")\n    server.start()\n    server.wait_for_termination()',
      isActive: false,
    },
  ],
};

// Add some example custom modules for each component type
const customModulesExample: Record<string, Module[]> = {
  classifier: [
    {
      id: 'custom-transformer',
      name: 'Custom Transformer',
      type: 'custom',
      code: 'import torch.nn as nn\n\nclass CustomTransformer(nn.Module):\n    def __init__(self):\n        super().__init__()\n        # Custom implementation\n        pass',
      isActive: false,
    },
  ],
  data_loader: [
    {
      id: 'custom-api-loader',
      name: 'Custom API Loader',
      type: 'custom',
      code: 'import requests\n\ndef load_from_api(endpoint, api_key):\n    headers = {"Authorization": f"Bearer {api_key}"}\n    response = requests.get(endpoint, headers=headers)\n    return response.json()',
      isActive: false,
    },
  ],
  data_transformer: [
    {
      id: 'custom-feature-extractor',
      name: 'Custom Feature Extractor',
      type: 'custom',
      code: 'def extract_features(data):\n    # Custom feature extraction logic\n    pass',
      isActive: false,
    },
  ],
  evaluator: [
    {
      id: 'custom-metric',
      name: 'Custom Metric',
      type: 'custom',
      code: 'def calculate_custom_metric(y_true, y_pred):\n    # Custom metric calculation\n    pass',
      isActive: false,
    },
  ],
  model_server: [
    {
      id: 'custom-deployment',
      name: 'Custom Deployment',
      type: 'custom',
      code: 'def deploy_model(model, config):\n    # Custom deployment logic\n    pass',
      isActive: false,
    },
  ],
};

const DRAWER_WIDTH = 400;

const ComponentDrawer: React.FC<Props> = ({ open, onClose, componentId, componentType }) => {
  const [modules, setModules] = useState<Module[]>([
    ...(defaultModules[componentType] || []),
    ...(customModulesExample[componentType] || []),
  ]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [output, setOutput] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCode, setEditingCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleUseModule = (moduleId: string) => {
    setModules(prevModules =>
      prevModules.map(m => ({
        ...m,
        isActive: m.id === moduleId,
      }))
    );
  };

  const handleCreateModule = () => {
    const newModule: Module = {
      id: `custom-${Date.now()}`,
      name: 'New Custom Module',
      type: 'custom',
      code: '# Write your custom code here\n',
      isActive: false,
    };
    setModules([...modules, newModule]);
    setSelectedModule(newModule);
    setIsEditing(true);
    setEditingCode(newModule.code);
    setShowCode(true);
  };

  const handleExecuteCode = () => {
    if (selectedModule) {
      // Simulate code execution
      setOutput(`Executing ${selectedModule.name}...\nOutput will appear here`);
    }
  };

  const handleSaveCode = () => {
    if (selectedModule) {
      setModules(prevModules =>
        prevModules.map(m =>
          m.id === selectedModule.id ? { ...m, code: editingCode } : m
        )
      );
      setIsEditing(false);
    }
  };

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    setEditingCode(module.code);
    setShowCode(true);
  };

  const handleBackClick = () => {
    setShowCode(false);
    setSelectedModule(null);
    setIsEditing(false);
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        bgcolor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'rgb(0 0 0 / 8%) 0px 5px 20px',
        position: 'absolute',
        right: 0,
        top: 0,
        transform: open ? 'translateX(0)' : `translateX(${DRAWER_WIDTH}px)`,
        transition: theme => theme.transitions.create('transform', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 1.5, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {showCode && (
            <IconButton 
              size="small" 
              onClick={handleBackClick}
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {showCode ? (selectedModule?.name || 'Module Code') : 'Component Settings'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {!showCode ? (
        // Modules List View
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}>
          {/* Default Modules Section - Top Half */}
          <Box sx={{ 
            flex: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            overflow: 'auto',
            p: 1.5,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'action.hover',
              borderRadius: '3px',
            },
          }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
              }}
            >
              Default Modules
            </Typography>
            <List sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
              {modules
                .filter(m => m.type === 'default')
                .map(module => (
                  <ListItem
                    key={module.id}
                    sx={{ 
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <ListItemText
                      primary={module.name}
                      sx={{ 
                        cursor: 'pointer',
                        '& .MuiTypography-root': {
                          fontWeight: 500,
                          color: 'text.primary',
                          fontSize: '0.875rem',
                        },
                        my: 0,
                      }}
                      onClick={() => handleModuleClick(module)}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        variant={module.isActive ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleUseModule(module.id)}
                        sx={{ 
                          minWidth: '50px',
                          borderRadius: 1,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 0.5,
                          px: 1,
                          fontSize: '0.75rem',
                        }}
                      >
                        {module.isActive ? 'Active' : 'Use'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleModuleClick(module)}
                        sx={{ 
                          borderRadius: 1,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 0.5,
                          px: 1,
                          fontSize: '0.75rem',
                        }}
                      >
                        Code
                      </Button>
                    </Box>
                  </ListItem>
                ))}
            </List>
          </Box>

          {/* Custom Modules Section - Bottom Half */}
          <Box sx={{ 
            flex: 1,
            overflow: 'auto',
            p: 1.5,
            bgcolor: '#F8FAFF',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'action.hover',
              borderRadius: '3px',
            },
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              mb: 1,
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                Custom Modules
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateModule}
                size="small"
                sx={{ 
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  py: 0.5,
                  px: 1,
                  fontSize: '0.75rem',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                Create
              </Button>
            </Box>
            <List sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
              {modules
                .filter(m => m.type === 'custom')
                .map(module => (
                  <ListItem
                    key={module.id}
                    sx={{ 
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <ListItemText
                      primary={module.name}
                      sx={{ 
                        cursor: 'pointer',
                        '& .MuiTypography-root': {
                          fontWeight: 500,
                          color: 'text.primary',
                          fontSize: '0.875rem',
                        },
                        my: 0,
                      }}
                      onClick={() => handleModuleClick(module)}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        variant={module.isActive ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleUseModule(module.id)}
                        sx={{ 
                          minWidth: '50px',
                          borderRadius: 1,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 0.5,
                          px: 1,
                          fontSize: '0.75rem',
                        }}
                      >
                        {module.isActive ? 'Active' : 'Use'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleModuleClick(module)}
                        sx={{ 
                          borderRadius: 1,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 0.5,
                          px: 1,
                          fontSize: '0.75rem',
                        }}
                      >
                        Code
                      </Button>
                    </Box>
                  </ListItem>
                ))}
            </List>
          </Box>
        </Box>
      ) : (
        // Code Editor and Output View
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          bgcolor: '#F8FAFF',
        }}>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}>
            {isEditing ? (
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveCode}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                Save
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={<CodeIcon />}
                onClick={() => setIsEditing(true)}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                Edit
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={handleExecuteCode}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
            >
              Run
            </Button>
          </Box>

          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            p: 2.5, 
            gap: 2,
          }}>
            <TextField
              multiline
              fullWidth
              rows={12}
              value={isEditing ? editingCode : selectedModule?.code}
              onChange={(e) => setEditingCode(e.target.value)}
              disabled={!isEditing}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            />

            <Paper
              sx={{
                flex: 1,
                p: 2.5,
                bgcolor: '#1A2027',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                borderRadius: 2,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                },
              }}
            >
              <pre>{output || 'No output yet. Click "Run" to execute the code.'}</pre>
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ComponentDrawer; 