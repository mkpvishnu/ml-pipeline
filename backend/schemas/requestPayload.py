from pydantic import BaseModel
from typing import List, Dict, Union

class ModuleConfig(BaseModel):
    module_id: str
    identifier: str
    user_config: Dict[str, Union[str, int, float, Dict]]

class CanvasPayload(BaseModel):
    canvas_id: str
    canvas_config: List[ModuleConfig]

