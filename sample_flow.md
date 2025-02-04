# ML Pipeline Sample Flow: Document Ingestion Pipeline

## Overview
This document demonstrates the complete flow of creating and executing a document ingestion pipeline, from creating modules to running the pipeline.

## 1. Default Module Creation
First, we create the default modules that will be available globally.

### 1.1 S3 Downloader Module
```json
POST /api/v1/modules
Headers: {
    "account_id": "1",
    "group_id": "1"
}
Body: {
    "name": "S3 Downloader",
    "identifier": "s3_downloader",
    "description": "Download files from S3 bucket",
    "scope": "global",
    "code": "import boto3\n...",  // Module implementation
    "config_schema": {
        "fields": [
            [
                {
                    "id": "bucket",
                    "type": "text",
                    "title": "S3 Bucket",
                    "required": true
                },
                {
                    "id": "path",
                    "type": "text",
                    "title": "File Path",
                    "required": true
                }
            ]
        ]
    },
    "outputs": {
        "file": {
            "type": "file",
            "description": "Downloaded file"
        },
        "metadata": {
            "type": "dict",
            "description": "File metadata"
        }
    }
}
```

### 1.2 File Chunker Module
```json
POST /api/v1/modules
Headers: {
    "account_id": "1",
    "group_id": "1"
}
Body: {
    "name": "File Chunker",
    "identifier": "file_chunker",
    "description": "Chunk files into smaller pieces",
    "scope": "global",
    "code": "def process(file, chunk_size):\n...",  // Module implementation
    "config_schema": {
        "fields": [
            [
                {
                    "id": "input_file",
                    "type": "source",
                    "title": "Input File",
                    "required": true,
                    "accepts": ["file"]
                },
                {
                    "id": "chunk_size",
                    "type": "number",
                    "title": "Chunk Size (KB)",
                    "required": true,
                    "min": 1,
                    "max": 1000
                },
                {
                    "id": "overlap",
                    "type": "number",
                    "title": "Overlap Size (KB)",
                    "required": false,
                    "min": 0,
                    "max": 100
                }
            ]
        ]
    },
    "outputs": {
        "chunks": {
            "type": "list",
            "description": "List of file chunks"
        },
        "chunk_metadata": {
            "type": "dict",
            "description": "Chunking metadata"
        }
    }
}
```

### 1.3 Text Preprocessor Module
```json
POST /api/v1/modules
Headers: {
    "account_id": "1",
    "group_id": "1"
}
Body: {
    "name": "Text Preprocessor",
    "identifier": "preprocessor",
    "description": "Preprocess text chunks",
    "scope": "global",
    "code": "def preprocess(chunks, steps):\n...",  // Module implementation
    "config_schema": {
        "fields": [
            [
                {
                    "id": "input_chunks",
                    "type": "source",
                    "title": "Input Chunks",
                    "required": true,
                    "accepts": ["list"]
                },
                {
                    "id": "preprocessing_steps",
                    "type": "multiselect",
                    "title": "Preprocessing Steps",
                    "required": true,
                    "options": [
                        {"id": "remove_whitespace", "name": "Remove Extra Whitespace"},
                        {"id": "lowercase", "name": "Convert to Lowercase"},
                        {"id": "remove_special_chars", "name": "Remove Special Characters"}
                    ]
                }
            ]
        ]
    },
    "outputs": {
        "processed_chunks": {
            "type": "list",
            "description": "Processed text chunks"
        }
    }
}
```

### 1.4 Text Embedder Module
```json
POST /api/v1/modules
Headers: {
    "account_id": "1",
    "group_id": "1"
}
Body: {
    "name": "Text Embedder",
    "identifier": "embedder",
    "description": "Generate embeddings from text",
    "scope": "global",
    "code": "from openai import OpenAI\n...",  // Module implementation
    "config_schema": {
        "fields": [
            [
                {
                    "id": "input_text",
                    "type": "source",
                    "title": "Input Text",
                    "required": true,
                    "accepts": ["list"]
                },
                {
                    "id": "model",
                    "type": "dropdown",
                    "title": "Embedding Model",
                    "required": true,
                    "options": [
                        {"id": "openai", "name": "OpenAI Ada"},
                        {"id": "huggingface", "name": "HuggingFace"},
                        {"id": "cohere", "name": "Cohere"}
                    ]
                }
            ]
        ]
    },
    "outputs": {
        "embeddings": {
            "type": "list",
            "description": "Generated embeddings"
        },
        "embedding_metadata": {
            "type": "dict",
            "description": "Embedding generation metadata"
        }
    }
}
```

### 1.5 Vector Store Module
```json
POST /api/v1/modules
Headers: {
    "account_id": "1",
    "group_id": "1"
}
Body: {
    "name": "Vector Store",
    "identifier": "vector_store",
    "description": "Store vectors in database",
    "scope": "global",
    "code": "import pinecone\n...",  // Module implementation
    "config_schema": {
        "fields": [
            [
                {
                    "id": "input_vectors",
                    "type": "source",
                    "title": "Input Vectors",
                    "required": true,
                    "accepts": ["list"]
                },
                {
                    "id": "metadata",
                    "type": "source",
                    "title": "Vector Metadata",
                    "required": false,
                    "accepts": ["dict"]
                },
                {
                    "id": "store_type",
                    "type": "dropdown",
                    "title": "Vector Store Type",
                    "required": true,
                    "options": [
                        {"id": "pinecone", "name": "Pinecone"},
                        {"id": "qdrant", "name": "Qdrant"},
                        {"id": "weaviate", "name": "Weaviate"}
                    ]
                }
            ]
        ]
    },
    "outputs": {
        "store_status": {
            "type": "dict",
            "description": "Storage operation status"
        }
    }
}
```

## 2. Creating Custom Modules
Users can create custom modules by extending default modules:

```json
POST /api/v1/modules
Headers: {
    "account_id": "1",
    "group_id": "1"
}
Body: {
    "name": "Custom PDF Processor",
    "identifier": "custom_pdf_processor",
    "description": "Custom PDF processing pipeline",
    "scope": "account",
    "parent_module_id": "file_chunker",
    "config_schema": {
        "fields": [
            [
                {
                    "id": "input_file",
                    "type": "source",
                    "title": "Input PDF",
                    "required": true,
                    "accepts": ["file"],
                    "file_types": ["pdf"]
                },
                {
                    "id": "chunk_size",
                    "type": "number",
                    "title": "Page Chunk Size",
                    "required": true,
                    "min": 1,
                    "max": 5
                }
            ]
        ]
    }
}
```

## 3. Canvas Creation
When users drag and drop modules to create a pipeline:

```json
POST /api/v1/canvas
Headers: {
    "account_id": "1"
}
Body: {
    "name": "Document Ingestion Pipeline",
    "description": "Pipeline to ingest documents into vector store",
    "module_config": {
        "nodes": [
            {
                "id": "node1",
                "position": {"x": 100, "y": 100},
                "data": {
                    "moduleId": "s3_downloader",
                    "name": "S3 Downloader"
                }
            },
            {
                "id": "node2",
                "position": {"x": 300, "y": 100},
                "data": {
                    "moduleId": "file_chunker",
                    "name": "File Chunker"
                }
            },
            {
                "id": "node3",
                "position": {"x": 500, "y": 100},
                "data": {
                    "moduleId": "preprocessor",
                    "name": "Text Preprocessor"
                }
            },
            {
                "id": "node4",
                "position": {"x": 700, "y": 100},
                "data": {
                    "moduleId": "embedder",
                    "name": "Text Embedder"
                }
            },
            {
                "id": "node5",
                "position": {"x": 900, "y": 100},
                "data": {
                    "moduleId": "vector_store",
                    "name": "Vector Store"
                }
            }
        ],
        "edges": [
            {
                "id": "edge1",
                "source": "node1",
                "target": "node2",
                "type": "smoothstep",
                "animated": true
            },
            {
                "id": "edge2",
                "source": "node2",
                "target": "node3",
                "type": "smoothstep",
                "animated": true
            },
            {
                "id": "edge3",
                "source": "node3",
                "target": "node4",
                "type": "smoothstep",
                "animated": true
            },
            {
                "id": "edge4",
                "source": "node4",
                "target": "node5",
                "type": "smoothstep",
                "animated": true
            }
        ]
    }
}
```

## 4. Module Configurations
After creating the canvas, configure each module:

### 4.1 S3 Downloader Config
```json
PATCH /api/v1/modules/{module_id}/user-config
Headers: {
    "account_id": "1"
}
Body: {
    "user_config": {
        "bucket": "my-document-bucket",
        "path": "documents/sample.pdf"
    }
}
```

### 4.2 File Chunker Config
```json
PATCH /api/v1/modules/{module_id}/user-config
Headers: {
    "account_id": "1"
}
Body: {
    "user_config": {
        "input_file": {
            "module_id": "node1",
            "output_key": "file"
        },
        "chunk_size": 500,
        "overlap": 50
    }
}
```

### 4.3 Preprocessor Config
```json
PATCH /api/v1/modules/{module_id}/user-config
Headers: {
    "account_id": "1"
}
Body: {
    "user_config": {
        "input_chunks": {
            "module_id": "node2",
            "output_key": "chunks"
        },
        "preprocessing_steps": [
            "remove_whitespace",
            "lowercase"
        ]
    }
}
```

### 4.4 Embedder Config
```json
PATCH /api/v1/modules/{module_id}/user-config
Headers: {
    "account_id": "1"
}
Body: {
    "user_config": {
        "input_text": {
            "module_id": "node3",
            "output_key": "processed_chunks"
        },
        "model": "openai"
    }
}
```

### 4.5 Vector Store Config
```json
PATCH /api/v1/modules/{module_id}/user-config
Headers: {
    "account_id": "1"
}
Body: {
    "user_config": {
        "input_vectors": {
            "module_id": "node4",
            "output_key": "embeddings"
        },
        "metadata": {
            "module_id": "node4",
            "output_key": "embedding_metadata"
        },
        "store_type": "pinecone"
    }
}
```

## 5. Running the Pipeline
Execute the entire pipeline:

```json
POST /api/v1/canvas/{canvas_id}/run
Headers: {
    "account_id": "1"
}
Body: {
    "modules": {
        "s3_downloader": {
            "identifier": "s3_downloader",
            "user_config": {
                "bucket": "my-document-bucket",
                "path": "documents/sample.pdf"
            }
        },
        "file_chunker": {
            "identifier": "file_chunker",
            "user_config": {
                "input_file": {
                    "module_id": "s3_downloader",
                    "output_key": "file"
                },
                "chunk_size": 500,
                "overlap": 50
            }
        },
        "preprocessor": {
            "identifier": "preprocessor",
            "user_config": {
                "input_chunks": {
                    "module_id": "file_chunker",
                    "output_key": "chunks"
                },
                "preprocessing_steps": [
                    "remove_whitespace",
                    "lowercase"
                ]
            }
        },
        "embedder": {
            "identifier": "embedder",
            "user_config": {
                "input_text": {
                    "module_id": "preprocessor",
                    "output_key": "processed_chunks"
                },
                "model": "openai"
            }
        },
        "vector_store": {
            "identifier": "vector_store",
            "user_config": {
                "input_vectors": {
                    "module_id": "embedder",
                    "output_key": "embeddings"
                },
                "metadata": {
                    "module_id": "embedder",
                    "output_key": "embedding_metadata"
                },
                "store_type": "pinecone"
            }
        }
    }
}

Response: {
    "run_id": "run123",
    "status": "REQUESTED",
    "started_at": "2024-01-30T12:00:00Z"
}
```

## 6. Checking Run Status
Monitor the pipeline execution:

```json
GET /api/v1/runs/{run_id}/status
Headers: {
    "account_id": "1"
}
Response: {
    "status": "COMPLETED",
    "started_at": "2024-01-30T12:00:00Z",
    "completed_at": "2024-01-30T12:05:00Z",
    "error": null
}
```

## Flow Explanation

1. **Module Creation**:
   - Default modules are created with global scope
   - Each module defines its config schema and outputs
   - Custom modules can extend default modules

2. **Canvas Creation**:
   - Users drag and drop modules to create a pipeline
   - Connections between modules are stored in module_config
   - Position information is preserved for UI rendering

3. **Module Configuration**:
   - Each module requires configuration
   - Source fields reference outputs from upstream modules
   - Configuration is validated against the module's schema

4. **Pipeline Execution**:
   - The run API triggers pipeline execution
   - External service processes modules in order
   - Status updates are provided via the status API

5. **Data Flow**:
   - S3 Downloader → Downloads file
   - File Chunker → Splits file into chunks
   - Preprocessor → Cleans text chunks
   - Embedder → Generates vectors
   - Vector Store → Stores embeddings

6. **Error Handling**:
   - Each module can report errors
   - Pipeline execution stops on error
   - Error details are available in run status

This flow demonstrates a complete document ingestion pipeline from creation to execution, with proper configuration and data flow between modules. 