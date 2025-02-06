import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../services/api';
import './NodeSettings.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid2';
import { DOMAIN, ACCOUNT_ID } from '../constants/app';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface NodeSettingsProps {
  nodeId: string;
  onClose: () => void;
  onSave: (config: {
    name: string;
    description: string;
    user_config: Record<string, any>;
  }) => void;
}

interface ModuleConfig {
  name: string;
  description: string;
  config_schema: Record<string, any>;
  user_config?: Record<string, any>;
}

const NodeSettings: React.FC<NodeSettingsProps> = ({
  nodeId,
  groupId,
  onClose,
  nodes,
  edges,
  handleNodeSave,
  isLoading: saveIsLoading
}) => {
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [module, setModule] = useState<ModuleConfig | null>(null);
  const [updatedModule, setUpdatedModule] = useState<ModuleConfig | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userConfig, setUserConfig] = useState([]);

  // useEffect(() => {
  //   const fetchModule = async () => {
  //     try {
  //       setIsLoading(true);
  //       setError(null);
  //       const response = await api.modules.get(nodeId);
  //       if (response.data) {
  //         setModule(response.data);
  //         setUpdatedModule(response.data);
  //         setName(response.data.name);
  //         setDescription(response.data.description || '');
  //         setUserConfig(response.data.user_config || []);
  //       } else {
  //         setError('Module not found');
  //       }
  //     } catch (err) {
  //       console.error('Error fetching module:', err);
  //       setError('Failed to load module configuration');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchModule();
  // }, [nodeId]);

  useEffect(() => {
    const fetchModule = async () => {
      setIsLoading(true);
      setError(null);
      fetch(`${DOMAIN}/api/v1/modules/${nodeId}?x=nothing`, {
        headers: {
          'Content-Type': 'application/json',
          'account-id': ACCOUNT_ID,
          'group-id': groupId,
          accept: 'application/json',
        },
      }).then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setModule(data);
        setUpdatedModule({
          ...data,
          config_schema: {
            ...data.config_schema,
            ...(data.config_schema.fields.length === data.user_config.length ? {} : { fields : Array(data.user_config.length - 1).fill([...data.config_schema.fields[0]]) })
          }
        });
        setName(data.name);
        setDescription(data.description || '');
        setUserConfig(data.user_config || []);
      }).catch((err) => {
        console.error('Error fetching module:', err);
        setError('Failed to load module configuration');
      }).finally(() => {
        setIsLoading(false);
      });
    };

    if (nodeId) {
      fetchModule();
    }
  }, [nodeId]);

  const renderSchemaField = (
    field, idx
  ) => {
    // module.arraySupported
    // module.user_config
    const config = userConfig[idx];
    const {id, type, title, description, options, watchOn, dependentOn, sourceType, showOn} = field;
    let parentNodeEdges = [];
    let sourceOptions = [];
    // console.log({field, idx, watchOn, dependentOn, module, userConfig, config, sourceType, edges});
    // console.log({ nodes, edges });

    if (sourceType) {
      parentNodeEdges = edges?.filter(ed => ed.target === nodeId) || [];
      // console.log({ nodeId, sourceType, edges, parentNodeEdges });

      parentNodeEdges.forEach(p => {
        const source = p.source;
        const selectedModule = nodes.find(n => n.id === source)
        const sourceName = nodes.find(n => n.id === source)
        console.log({ nodes, parentNodeEdges, source, selectedModule, sourceName, sourceType });
        if (selectedModule.data?.status === 'published' && selectedModule.data?.output_schema[sourceType]) {
          // if (selectedModule.data.moduleData?.output_schema[sourceType]) {
          // before setting sourceType, iterate and prefix the module id in the label
          const updatedOptions = selectedModule.data.output_schema[sourceType].map(s => ({ ...s, id: `${source}.${s.id}`, name: `${sourceName.data.name} - ${s.name}`}))
          sourceOptions = [...sourceOptions, ...updatedOptions]
        }
      })
    }

    const handleChange = (value) => {
      
      setUserConfig(prevConfig =>
        prevConfig.map((conf, i) =>
          i === idx
            ? { ...conf, [id]: value }
            : conf
        )
      );

      const items = module?.config_schema.fields[idx];
      const watchIdx = items.findIndex(f => f.id === watchOn);
      const watchItm = items.find(f => f.id === watchOn);
      // console.log({ id, value, idx, watchOn, items, watchIdx, watchItm});

      setUpdatedModule(prevModule => ({
        ...prevModule,
        config_schema: {
          ...prevModule?.config_schema,
          fields: module.config_schema.fields.map((f, i) =>
            i === idx 
              ? f.map((lf, li) =>
                li === watchIdx
                  ? { ...lf, options: lf.options.filter(s => s[id] === value) }
                  : lf
              )
              : f
          )
        },
        user_config: updatedModule.user_config.map((conf, i) =>
          i === idx
            ? { ...conf, [id]: value }
            : conf
        )
      }))
    }

    const showOnValue = showOn ? userConfig[idx][showOn.split('.')[0]] : '';
    // console.log({ field, showOn, showOnValue });
    
    switch (type) {
      case 'string':
        return !showOn || (showOn?.split('.')[1] === showOnValue) ? (
          <TextField
            fullWidth
            label={title} 
            value={config[id]}
            onChange={(e) => {
              handleChange(e.target.value)
            }}
            placeholder={description} 
            size="small"
          />
        ) : null;
      case 'textarea':
        return !showOn || (showOn?.split('.')[1] === showOnValue) ? (
          <TextField
            id="outlined-multiline-static"
            fullWidth
            label={title} 
            value={config[id]}
            onChange={(e) => {
              handleChange(e.target.value)
            }}
            placeholder={description} 
            multiline
            rows={4}
          />
        ) : null;
      case 'number':
        return !showOn || (showOn?.split('.')[1] === showOnValue) ? (
          <TextField
            type="number"
            fullWidth
            label={title} 
            value={config[id]}
            onChange={(e) => {
              handleChange(e.target.value)
            }}
            placeholder={description} 
            size="small"
          />
        ) : null;
      case 'checkbox':
        return !showOn || (showOn?.split('.')[1] === showOnValue) ? (
          <FormGroup>
            <FormControlLabel
              control={
                <Switch 
                  checked={config[id]}
                  onChange={(e) => {
                    handleChange(e.target.checked)
                  }}
                />
              }
              label={title}
            />
          </FormGroup>
        ) : null;
      case 'dropdown':
        const updatedOptions = sourceType ? sourceOptions : options;
        // const updatedValue = sourceType ? config[id] && config[id].split('-')[1].trim() : config[id];
        
        return !showOn || (showOn?.split('.')[1] === showOnValue) ? (
          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-label">{title}</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={config[id]}
              label={title}
              onChange={(e) => {
                handleChange(e.target.value)
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {updatedOptions?.map((opt, id) =>  <MenuItem key={id} value={opt.id}>{opt.name}</MenuItem>)}
            </Select>
          </FormControl>
        ) : null
      case 'upload':
        return !showOn || (showOn?.split('.')[1] === showOnValue) ? (
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            Upload files
            <VisuallyHiddenInput
              type="file"
              onChange={(event) => {
                // console.log(event.target.files)
                handleChange(event.target.files)
              }}
              multiple
            />
          </Button>
        ) : null
      default:
        return null;
    }
  };

  // if (error || !module) {
  //   return (
  //     <div className="node-settings">
  //       <div className="error-message">{error || 'Module not found'}</div>
  //     </div>
  //   );
  // }

  const addSet = () => {
    const localUpdatedModule = {
      ...updatedModule,
      config_schema: {
        ...updatedModule.config_schema,
        fields: [
          ...updatedModule.config_schema.fields,
          updatedModule.config_schema.fields[0]
        ]
      },
      user_config: [
        ...updatedModule.user_config,
        updatedModule.user_config[0]
      ]
    }
    setModule({
      ...module,
      config_schema: {
        ...module.config_schema,
        fields: [
          ...module.config_schema.fields,
          module.config_schema.fields[0]
        ]
      },
      user_config: [
        ...module.user_config,
        module.user_config[0]
      ]
    });
    setUpdatedModule(localUpdatedModule);
    setUserConfig([...userConfig, updatedModule.user_config[0]])
  }

  const onSave = () => {
    // console.log({ userConfig, updatedModule });
    handleNodeSave({...updatedModule, name, description});
  }

  // console.log({ nodeId, node, module, userConfig });
  // console.log(module, name, description);
  // console.log({ updatedModule });

  return (
    <div className="node-settings">
      <div className="node-settings-header">
        <div className="node-settings-title">Module Settings</div>
        <button className="node-settings-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="node-settings-content">
        {isLoading ? (
          <Stack spacing={1}>
            <Skeleton variant="text" width={64} animation="wave" />
            <Skeleton variant="rounded" height={40} animation="wave" />
            <Skeleton variant="text" width={64} animation="wave" />
            <Skeleton variant="rounded" height={40} animation="wave" />
            <Skeleton variant="text" width={64} animation="wave" />
            <Skeleton variant="rounded" height={40} animation="wave" />
          </Stack>
        ) : (
          <form className="schema-form">
            <div className="form-group">
              <TextField
                label={"Name"} 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
              />
            </div>

            <div className="form-group">
              <TextField
                multiline
                label={"Description"} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                size="small"
              />
            </div>

            {updatedModule.config_schema && updatedModule.config_schema.fields.map((field, idx) => (
              <div key={idx}>
                <div className='mb'>
                  {updatedModule.config_schema.fields.length > 1 ? `Record ${idx +1}` : null}
                </div>
                {field.map((f, id) => (
                  <div className="form-group" key={id}>
                    {/* <div className="schema-field-header">
                      <div className="schema-field-title">{schema.title || key}</div>
                      {schema.description && (
                        <div className="schema-field-description">{schema.description}</div>
                      )}
                    </div> */}
                    <Box
                      noValidate
                      autoComplete="off"
                    >
                      
                      {renderSchemaField(
                        f,
                        idx,
                      )}
                    </Box>
                  </div>
                ))}
              </div>
            ))}
            <Grid container spacing={2}>
              {updatedModule.config_schema.arraySupported && (
                <Grid offset={{ md: 'auto' }}>
                  <Button startIcon={<AddIcon />} variant="contained" onClick={addSet}>Add</Button>
                </Grid>
              )}
            </Grid>
          </form>
        )}
      </div>

      <div className="node-settings-footer">
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave} loading={saveIsLoading}>{module?.type === 'custom' ? 'Update' : 'Save'}</Button>
      </div>
    </div>
  );
};

export default NodeSettings; 