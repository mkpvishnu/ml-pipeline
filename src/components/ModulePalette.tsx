import React from 'react';
import { Box, Paper, Typography, List, ListItem, Divider, Collapse } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ApiIcon from '@mui/icons-material/Api';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const componentCategories = [
  {
    title: 'Data Processing',
    components: [
      { type: 'data_loader', label: 'Data Loader', icon: StorageIcon },
      { type: 'data_transformer', label: 'Data Transformer', icon: StorageIcon },
    ],
  },
  {
    title: 'Model Components',
    components: [
      { type: 'classifier', label: 'Classifier', icon: ModelTrainingIcon },
      { type: 'regressor', label: 'Regressor', icon: ModelTrainingIcon },
    ],
  },
  {
    title: 'Evaluation',
    components: [
      { type: 'evaluator', label: 'Model Evaluator', icon: AssessmentIcon },
      { type: 'validator', label: 'Cross Validator', icon: AssessmentIcon },
    ],
  },
  {
    title: 'Deployment',
    components: [
      { type: 'api_endpoint', label: 'API Endpoint', icon: ApiIcon },
      { type: 'model_server', label: 'Model Server', icon: ApiIcon },
    ],
  },
];

const ModulePalette: React.FC = () => {
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>(
    Object.fromEntries(componentCategories.map(cat => [cat.title, true]))
  );

  const onDragStart = (event: React.DragEvent, componentType: string) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <Paper
      sx={{
        width: 280,
        borderRight: 1,
        borderColor: 'divider',
        overflow: 'auto',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Components
        </Typography>
        <List>
          {componentCategories.map(({ title, components }, index) => (
            <React.Fragment key={title}>
              {index > 0 && <Divider sx={{ my: 1 }} />}
              <ListItem
                button
                onClick={() => toggleCategory(title)}
                sx={{ py: 0.5 }}
              >
                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                  {title}
                </Typography>
                {openCategories[title] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openCategories[title]}>
                <List disablePadding>
                  {components.map(({ type, label, icon: Icon }) => (
                    <ListItem
                      key={type}
                      draggable
                      onDragStart={(e) => onDragStart(e, type)}
                      sx={{
                        pl: 2,
                        cursor: 'grab',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Icon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">{label}</Typography>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default ModulePalette; 