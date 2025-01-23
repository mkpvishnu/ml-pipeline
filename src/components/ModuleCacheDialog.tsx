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
  LinearProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CachedIcon from '@mui/icons-material/Cached';
import StorageIcon from '@mui/icons-material/Storage';

interface CacheEntry {
  id: string;
  moduleId: string;
  moduleName: string;
  timestamp: string;
  size: string;
  status: 'valid' | 'stale' | 'invalid';
  inputHash: string;
  storageUsed: number;
  runId: string;
}

const sampleCache: CacheEntry[] = [
  {
    id: 'cache-1',
    moduleId: 'preprocess-1',
    moduleName: 'Preprocessing',
    timestamp: '2024-01-15 14:30:00',
    size: '2.5GB',
    status: 'valid',
    inputHash: '8f7d3b2e1a',
    storageUsed: 45,
    runId: 'run-1234',
  },
  {
    id: 'cache-2',
    moduleId: 'training-1',
    moduleName: 'Training',
    timestamp: '2024-01-15 14:35:00',
    size: '5.8GB',
    status: 'valid',
    inputHash: '9c4f2d8e3b',
    storageUsed: 75,
    runId: 'run-1234',
  },
  {
    id: 'cache-3',
    moduleId: 'validation-1',
    moduleName: 'Validation',
    timestamp: '2024-01-14 09:20:00',
    size: '1.2GB',
    status: 'stale',
    inputHash: '2a7c9f4e1d',
    storageUsed: 25,
    runId: 'run-1233',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const ModuleCacheDialog: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            Module Cache
            <Chip
              icon={<StorageIcon />}
              label="9.5GB/20GB Used"
              variant="outlined"
              size="small"
            />
          </Box>
          <Button
            startIcon={<CachedIcon />}
            variant="outlined"
            size="small"
          >
            Clear All Cache
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Cache Storage Usage
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={47.5} 
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            47.5% of total storage used
          </Typography>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Module</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Run ID</TableCell>
              <TableCell>Input Hash</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleCache.map((cache) => (
              <TableRow key={cache.id}>
                <TableCell>{cache.moduleName}</TableCell>
                <TableCell>
                  <Chip
                    label={cache.status}
                    size="small"
                    color={
                      cache.status === 'valid'
                        ? 'success'
                        : cache.status === 'stale'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{cache.size}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={cache.storageUsed} 
                      sx={{ height: 4, borderRadius: 1, mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Run Details">
                    <Button size="small" sx={{ textTransform: 'none' }}>
                      {cache.runId}
                    </Button>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {cache.inputHash}
                  </Typography>
                </TableCell>
                <TableCell>{cache.timestamp}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Delete Cache">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button 
                      size="small" 
                      variant="outlined"
                      disabled={cache.status !== 'valid'}
                    >
                      Use Cache
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

export default ModuleCacheDialog; 