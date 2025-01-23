import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DownloadIcon from '@mui/icons-material/Download';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

interface ModelVersion {
  id: string;
  version: string;
  timestamp: string;
  metrics: {
    accuracy: number;
    f1_score: number;
    precision: number;
    recall: number;
  };
  status: 'production' | 'staging' | 'archived';
  size: string;
  framework: string;
}

const sampleVersions: ModelVersion[] = [
  {
    id: 'v3',
    version: 'bert-tickets-v3',
    timestamp: '2024-01-15 14:30:00',
    metrics: {
      accuracy: 0.925,
      f1_score: 0.918,
      precision: 0.912,
      recall: 0.924,
    },
    status: 'production',
    size: '1.2GB',
    framework: 'PyTorch/BERT',
  },
  {
    id: 'v2',
    version: 'bert-tickets-v2',
    timestamp: '2024-01-10 09:15:00',
    metrics: {
      accuracy: 0.898,
      f1_score: 0.892,
      precision: 0.887,
      recall: 0.897,
    },
    status: 'staging',
    size: '1.2GB',
    framework: 'PyTorch/BERT',
  },
  {
    id: 'v1',
    version: 'bert-tickets-v1',
    timestamp: '2024-01-05 11:20:00',
    metrics: {
      accuracy: 0.856,
      f1_score: 0.848,
      precision: 0.842,
      recall: 0.854,
    },
    status: 'archived',
    size: '1.2GB',
    framework: 'PyTorch/BERT',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const ModelVersionDialog: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Model Versions
          <Button
            startIcon={<CompareArrowsIcon />}
            variant="outlined"
            size="small"
          >
            Compare Versions
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Metrics</TableCell>
              <TableCell>Framework</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleVersions.map((version) => (
              <TableRow key={version.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {version.status === 'production' && (
                      <Tooltip title="Production Model">
                        <StarIcon sx={{ color: 'warning.main' }} fontSize="small" />
                      </Tooltip>
                    )}
                    {version.version}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={version.status}
                    size="small"
                    color={
                      version.status === 'production'
                        ? 'success'
                        : version.status === 'staging'
                        ? 'primary'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      Accuracy: {(version.metrics.accuracy * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      F1: {(version.metrics.f1_score * 100).toFixed(1)}% | 
                      P: {(version.metrics.precision * 100).toFixed(1)}% | 
                      R: {(version.metrics.recall * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{version.framework}</TableCell>
                <TableCell>{version.size}</TableCell>
                <TableCell>{version.timestamp}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Download Model">
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button size="small" variant="outlined">
                      Use Version
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default ModelVersionDialog; 