from typing import NamedTuple, List, Set

class IdentifierMapping(NamedTuple):
    current_identifier: str
    previous_identifier: str

IDENTIFIER_MAPPING = (
    IdentifierMapping("preprocessor", "user_input"),
    IdentifierMapping("identifier3", "identifier2"),
)

def validate_identifier_mapping(current_identifier: str, previous_identifier: str) -> bool:
    for mapping in IDENTIFIER_MAPPING:
        if (
            mapping.current_identifier == current_identifier
            and mapping.previous_identifier == previous_identifier
        ):
            return True
    return False

def validate_identifier_sequence(identifier_sets: List[Set[str]]) -> bool:
    for i in range(len(identifier_sets) - 1):
        next_set = identifier_sets[i]
        current_set = identifier_sets[i + 1]

        for current in current_set:
            for previous in next_set:
                if not validate_identifier_mapping(current, previous):
                    return False
    return True


input_data = [ {"identifier3", "identifier1"}, {"identifier3"} ]

if validate_identifier_sequence(input_data):
    print("All mappings are valid!")
else:
    print("Invalid mapping found!")
