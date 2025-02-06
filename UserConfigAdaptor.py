from typing import Dict, Any, List, Union
import json

class UserConfigAdaptor:
    def __init__(self, graph_data: Dict[str, Any]):
        self.graph_data = graph_data
        self.nodes_by_id = {node["id"]: node["data"] for node in graph_data["nodes"]}
        self.edges = graph_data["edges"]
        
    def _flatten_user_config(self, config_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Flatten a list of user configs into a single dictionary."""
        if not config_list:
            return {}
        # Take the first config object since in the input format it's a list
        return config_list[0]
    
    def _process_input_references(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Convert input references to the required format only for keys starting with 'input_'."""
        processed_config = {}
        
        for key, value in config.items():
            if key.startswith("input_") and isinstance(value, str) and "." in value:
                # Handle module reference format (e.g., "33.content")
                module_id, output_key = value.split(".")
                processed_config[key] = {
                    "module_id": module_id,
                    "output_key": output_key
                }
            else:
                processed_config[key] = value
                
        return processed_config
    
    def transform(self) -> Dict[str, Any]:
        """Transform the graph data into the desired module format."""
        modules = {}
        
        # Process each node
        for node in self.graph_data["nodes"]:
            node_data = node["data"]
            node_id = node["id"]
            identifier = node_data["identifier"]
            
            # Create module entry using either node ID or identifier based on requirements
            module_key = node_id
            
            # Process user configuration
            user_config = self._flatten_user_config(node_data["user_config"])
            processed_config = self._process_input_references(user_config)
            
            modules[module_key] = {
                "identifier": identifier,
                "user_config": processed_config
            }
        
        return {"modules": modules}

    @classmethod
    def from_json_file(cls, file_path: str) -> 'GraphToModuleAdapter':
        """Create an adapter instance from a JSON file."""
        with open(file_path, 'r') as f:
            data = json.load(f)
        return cls(data)

    @classmethod
    def from_json_string(cls, json_string: str) -> 'GraphToModuleAdapter':
        """Create an adapter instance from a JSON string."""
        data = json.loads(json_string)
        return cls(data)


def transform_graph_to_modules(input_data: Union[str, Dict[str, Any]]) -> Dict[str, Any]:
    """
    Transform graph data to modules format.
    
    Args:
        input_data: Either a JSON string or a dictionary containing the graph data
        
    Returns:
        Dictionary in the desired modules format
    """
    try:
        if isinstance(input_data, str):
            adapter = UserConfigAdaptor.from_json_string(input_data)
        else:
            adapter = UserConfigAdaptor(input_data)
            
        return adapter.transform()
    except Exception as e:
        raise ValueError(f"Error transforming graph data: {str(e)}")


def validate_input(data: Dict[str, Any]) -> bool:
    """
    Validate the input data structure.
    
    Args:
        data: Input dictionary to validate
        
    Returns:
        bool: True if valid, raises ValueError if invalid
    """
    required_keys = {"nodes", "edges"}
    if not all(key in data for key in required_keys):
        raise ValueError(f"Missing required keys. Expected {required_keys}")
        
    if not isinstance(data["nodes"], list) or not isinstance(data["edges"], list):
        raise ValueError("'nodes' and 'edges' must be lists")
        
    for node in data["nodes"]:
        if "id" not in node or "data" not in node:
            raise ValueError("Each node must have 'id' and 'data' fields")
            
    return True