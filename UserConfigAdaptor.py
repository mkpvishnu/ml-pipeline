from typing import Dict, Any, List, Union
import json

class UserConfigAdaptor:
    def __init__(self, graph_data: Dict[str, Any]):
        self.graph_data = graph_data
        self.nodes_by_id = {node["id"]: node["data"] for node in graph_data["nodes"]}
        self.edges = graph_data["edges"]
        # Build a mapping of node IDs to their types for easy lookup
        self.node_types = {node["id"]: node["data"]["identifier"] for node in graph_data["nodes"]}

    def _flatten_user_config(self, config_list: List[Dict[str, Any]], identifier: str) -> Dict[str, Any]:
        """Flatten a list of user configs into a single dictionary with special handling for action_handler."""
        if not config_list:
            return {}

        if identifier == "action_handler":
            # Process action handler config specially
            requests = []
            for config in config_list:
                request = {
                    "type": config.get("baseType", "api"),
                    "method": config.get("method"),
                    "name": config.get("name"),
                    "url": config.get("url"),
                    "headers": json.loads(config.get("header", "{}")),
                    "request": json.loads(config.get("body", "{}"))
                }

                # Handle canvas-specific fields
                if config.get("baseType") == "canvas":
                    request = {
                        "type": "canvas",
                        "id": config.get("canvasList")
                    }

                requests.append(request)

            return {
                "requests": requests,
                # These will be dynamically updated later
                "input_contexts": {},
                "input_query": {}
            }
        else:
            # For other identifiers, keep existing behavior
            return config_list[0]

    def _process_input_references(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Convert input references to the required format only for keys starting with 'input_'."""
        processed_config = {}

        for key, value in config.items():
            if isinstance(value, dict) and all(k in value for k in ["module_id", "output_key"]):
                # Already in correct format, keep as is
                processed_config[key] = value
            elif key.startswith("input_") and isinstance(value, str) and "." in value:
                # Handle module reference format (e.g., "33.content")
                module_id, output_key = value.split(".")
                processed_config[key] = {
                    "module_id": module_id,
                    "output_key": output_key
                }
            else:
                processed_config[key] = value

        return processed_config
    
    def _find_predecessor(self, node_id: str, target_type: str = None) -> str:
        """
        Find the immediate predecessor of a given node, optionally filtering by identifier.
        
        Args:
            node_id: The ID of the node whose predecessor we want to find.
            target_type: (Optional) The identifier of the desired predecessor.
            
        Returns:
            The ID of the predecessor node, or None if no predecessor (of the specified type) is found.
        """
        for edge in self.edges:
            if edge["target"] == node_id:
                if target_type is None or self.node_types.get(edge["source"]) == target_type:
                    return edge["source"]
        return None

    def transform(self) -> Dict[str, Any]:
        """Transform the graph data into the desired module format."""
        modules = {}

        # Process each node
        for node in self.graph_data["nodes"]:
            node_data = node["data"]
            node_id = node["id"]
            identifier = node_data["identifier"]

            # Process user configuration based on identifier
            user_config = self._flatten_user_config(node_data["user_config"], identifier)
            processed_config = self._process_input_references(user_config)

            modules[node_id] = {
                "identifier": identifier,
                "user_config": processed_config
            }

        # --- Dynamic Updates for input_contexts and input_query ---
        for node_id, module in modules.items():
            if module["identifier"] == "openai_handler":
                # Find predecessor for input_query
                predecessor_id = self._find_predecessor(node_id)
                if predecessor_id:
                    # Check if the predecessor is the user_input
                    if modules[predecessor_id]["identifier"] == "user_input":
                        module["user_config"]["input_query"] = {
                            "module_id": predecessor_id,
                            "output_key": "input"  # Assuming 'input' is the output key for user_input
                        }
                    # Check if predecessor is an openai_handler (for decision handler)
                    elif modules[predecessor_id]["identifier"] == "openai_handler":
                        module["user_config"]["input_query"] = {
                            "module_id": predecessor_id,
                            "output_key": "response"  # Assuming 'response' is output key
                        }

            elif module["identifier"] == "action_handler":
                # Find the decision handler (openai_handler) for input_contexts
                decision_handler_id = self._find_predecessor(node_id, "openai_handler")
                if decision_handler_id:
                    module["user_config"]["input_contexts"] = {
                        "module_id": decision_handler_id,
                        "output_key": "response"
                    }
                # Find the user_input for the input_query
                user_input_id = self._find_predecessor(node_id, "user_input")
                if user_input_id:
                     module["user_config"]["input_query"] = {
                         "module_id":user_input_id,
                         "output_key":"input"
                     }
                else:
                    user_input_id = None
                    current_node = node_id
                    while user_input_id is None and current_node is not None:
                         current_node = self._find_predecessor(current_node)
                         if current_node is not None and modules[current_node]["identifier"] == "user_input":
                             user_input_id = current_node
                    if user_input_id:
                        module["user_config"]["input_query"] = {
                            "module_id": user_input_id,
                            "output_key": "input"  # Assuming 'input' is output
                        }



        return {"modules": modules, "canvas_name": self.graph_data.get("canvas_name", "")}


    @classmethod
    def from_json_file(cls, file_path: str) -> 'UserConfigAdaptor':
        """Create an adapter instance from a JSON file."""
        with open(file_path, 'r') as f:
            data = json.load(f)
        return cls(data)

    @classmethod
    def from_json_string(cls, json_string: str) -> 'UserConfigAdaptor':
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