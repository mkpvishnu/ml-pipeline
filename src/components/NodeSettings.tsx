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
import { DOMAIN, ACCOUNT_ID } from '../../constants/app';

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
  handleNodeSave
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
        setUpdatedModule(data);
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
    const {id, type, title, description, options, watchOn, dependentOn, sourceType} = field;
    let parentNodeEdges = [];
    let sourceOptions = [];
    // console.log({field, idx, watchOn, dependentOn, module, userConfig, config, sourceType, edges});
    // console.log({ nodes, edges });
    

    if (sourceType) {
      parentNodeEdges = edges?.filter(ed => ed.target === nodeId);
      // console.log({ nodeId, sourceType, edges, parentNodes });

      parentNodeEdges.forEach(p => {
        const source = p.source;
        const selectedModule = nodes.find(n => n.id === source)
        const sourceName = nodes.find(n => n.id === source)
        // console.log({ nodes, source, selectedModule, sourceName });
        if (selectedModule.data.moduleData?.state === 'PUBLISHED' && selectedModule.data.moduleData?.output_schema[sourceType]) {
        // if (selectedModule.data.moduleData?.output_schema[sourceType]) {
          // before setting sourceType, iterate and prefix the module id in the label
          const updatedOptions = selectedModule.data.moduleData.output_schema[sourceType].map(s => ({ ...s, id: `${source}.${s.id}`, name: `${sourceName.data.moduleData.name} - ${s.name}`}))
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

    switch (type) {
      case 'string':
        return (
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
        );
      case 'number':
        return (
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
        );
      case 'checkbox':
        return (
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
        );
      case 'dropdown':
        const updatedOptions = sourceType ? sourceOptions : options;
        // const updatedValue = sourceType ? config[id] && config[id].split('-')[1].trim() : config[id];
        
        return (
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
        )
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="node-settings">Loading...</div>;
  }

  if (error || !module) {
    return (
      <div className="node-settings">
        <div className="error-message">{error || 'Module not found'}</div>
      </div>
    );
  }

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

  return (
    <div className="node-settings">
      <div className="node-settings-header">
        <div className="node-settings-title">Module Settings</div>
        <button className="node-settings-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="node-settings-content">
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
            {updatedModule.arraySupported && (
              <Grid offset={{ md: 'auto' }}>
                <Button startIcon={<AddIcon />} variant="contained" onClick={addSet}>Add</Button>
              </Grid>
            )}
          </Grid>
        </form>
      </div>

      <div className="node-settings-footer">
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave}>{module.type === 'custom' ? 'Update' : 'Save'}</Button>
      </div>
    </div>
  );
};

export default NodeSettings; 