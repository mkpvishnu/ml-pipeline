import React from 'react';
import { Box, Paper, Typography, List, ListItem, Divider, Collapse } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TuneIcon from '@mui/icons-material/Tune';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const moduleCategories = [
  {
    title: 'Data',
    modules: [
      { type: 'data', label: 'Data Source', icon: StorageIcon },
      { type: 'data_transform', label: 'Data Transform', icon: TuneIcon },
      { type: 'feature_extraction', label: 'Feature Extraction', icon: AutoFixHighIcon },
      { type: 'data_augmentation', label: 'Data Augmentation', icon: AccountTreeIcon },
    ],
  },
  {
    title: 'Preprocessing',
    modules: [
      { type: 'preprocess', label: 'Preprocessing', icon: BuildIcon },
      { type: 'feature_selection', label: 'Feature Selection', icon: BubbleChartIcon },
      { type: 'dimensionality_reduction', label: 'Dimensionality Reduction', icon: TimelineIcon },
      { type: 'data_cleaning', label: 'Data Cleaning', icon: BuildIcon },
    ],
  },
  {
    title: 'Model',
    modules: [
      { type: 'training', label: 'Training', icon: SchoolIcon },
      { type: 'hyperparameter_tuning', label: 'Hyperparameter Tuning', icon: TuneIcon },
      { type: 'ensemble', label: 'Ensemble', icon: AccountTreeIcon },
      { type: 'transfer_learning', label: 'Transfer Learning', icon: PsychologyIcon },
    ],
  },
  {
    title: 'Evaluation',
    modules: [
      { type: 'validation', label: 'Validation', icon: CheckCircleIcon },
      { type: 'cross_validation', label: 'Cross Validation', icon: TimelineIcon },
      { type: 'metrics', label: 'Metrics', icon: BarChartIcon },
      { type: 'visualization', label: 'Visualization', icon: BubbleChartIcon },
    ],
  },
  {
    title: 'Deployment',
    modules: [
      { type: 'deployment', label: 'Deployment', icon: CloudUploadIcon },
      { type: 'monitoring', label: 'Monitoring', icon: TimelineIcon },
      { type: 'ab_testing', label: 'A/B Testing', icon: AccountTreeIcon },
      { type: 'model_serving', label: 'Model Serving', icon: CloudUploadIcon },
    ],
  },
];

const ModulePalette: React.FC = () => {
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>(
    Object.fromEntries(moduleCategories.map(cat => [cat.title, true]))
  );

  const onDragStart = (event: React.DragEvent, moduleType: string) => {
    event.dataTransfer.setData('application/reactflow', moduleType);
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
          Modules
        </Typography>
        <List>
          {moduleCategories.map(({ title, modules }, index) => (
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
                  {modules.map(({ type, label, icon: Icon }) => (
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