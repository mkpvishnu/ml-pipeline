#!/bin/bash

API_URL="http://localhost:8000/api/v1"

# Create Data Loader Module
echo "Creating Data Loader module..."
DATA_LOADER_RESPONSE=$(curl -s -X POST "$API_URL/modules/" \
-H "Content-Type: application/json" \
-d '{
  "name": "Data Loader",
  "type": "python",
  "description": "Loads sample data",
  "account_id": 1,
  "category": "data"
}')
DATA_LOADER_ID=$(echo $DATA_LOADER_RESPONSE | jq -r '.module_id')
echo "Data Loader ID: $DATA_LOADER_ID"

# Create Data Loader Version
echo "Creating Data Loader version..."
curl -s -X POST "$API_URL/modules/$DATA_LOADER_ID/versions" \
-H "Content-Type: application/json" \
-d '{
  "version": "v1",
  "module_id": "'"$DATA_LOADER_ID"'",
  "code": "import pandas as pd\nimport numpy as np\n\n# Create sample data\ndata = pd.DataFrame({\n    \"feature1\": np.random.rand(100),\n    \"feature2\": np.random.rand(100),\n    \"target\": np.random.randint(0, 2, 100)\n})\n\n# Store data in context\ncontext.set_var(\"training_data\", data)\ncached_results = [\"data\"]\nlogger.info(f\"Data shape: {data.shape}\")"
}'

# Create Preprocessor Module
echo "Creating Preprocessor module..."
PREPROCESSOR_RESPONSE=$(curl -s -X POST "$API_URL/modules/" \
-H "Content-Type: application/json" \
-d '{
  "name": "Preprocessor",
  "type": "python",
  "description": "Standardizes features",
  "account_id": 1,
  "category": "preprocessing"
}')
PREPROCESSOR_ID=$(echo $PREPROCESSOR_RESPONSE | jq -r '.module_id')
echo "Preprocessor ID: $PREPROCESSOR_ID"

# Create Preprocessor Version
echo "Creating Preprocessor version..."
curl -s -X POST "$API_URL/modules/$PREPROCESSOR_ID/versions" \
-H "Content-Type: application/json" \
-d '{
  "version": "v1",
  "module_id": "'"$PREPROCESSOR_ID"'",
  "code": "data = context.get_var(\"training_data\")\n\nfrom sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\nfeatures = [\"feature1\", \"feature2\"]\ndata[features] = scaler.fit_transform(data[features])\n\ncontext.set_var(\"processed_data\", data)\ncontext.set_var(\"scaler\", scaler)\ncached_results = [\"data\", \"scaler\"]\nlogger.info(f\"Preprocessed data shape: {data.shape}\")"
}'

# Create Training Module
echo "Creating Training module..."
TRAINER_RESPONSE=$(curl -s -X POST "$API_URL/modules/" \
-H "Content-Type: application/json" \
-d '{
  "name": "Model Trainer",
  "type": "python",
  "description": "Trains logistic regression model",
  "account_id": 1,
  "category": "training"
}')
TRAINER_ID=$(echo $TRAINER_RESPONSE | jq -r '.module_id')
echo "Trainer ID: $TRAINER_ID"

# Create Training Version
echo "Creating Training version..."
curl -s -X POST "$API_URL/modules/$TRAINER_ID/versions" \
-H "Content-Type: application/json" \
-d '{
  "version": "v1",
  "module_id": "'"$TRAINER_ID"'",
  "code": "from sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\n\ndata = context.get_var(\"processed_data\")\n\nfeatures = [\"feature1\", \"feature2\"]\nX = data[features]\ny = data[\"target\"]\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)\n\ntrain_score = model.score(X_train, y_train)\ntest_score = model.score(X_test, y_test)\n\ncontext.set_var(\"model\", model)\ncontext.set_var(\"model_scores\", {\"train_score\": train_score, \"test_score\": test_score})\ncached_results = [\"model\", \"model_scores\"]\nlogger.info(f\"Train score: {train_score:.3f}, Test score: {test_score:.3f}\")"
}'

# Create Canvas
echo "Creating Canvas..."
CANVAS_RESPONSE=$(curl -s -X POST "$API_URL/canvases/" \
-H "Content-Type: application/json" \
-d '{
  "name": "ML Training Pipeline",
  "description": "Basic ML pipeline with data loading, preprocessing, and training",
  "account_id": 1,
  "module_config": {
    "'"$DATA_LOADER_ID"'": {
      "module_id": "'"$DATA_LOADER_ID"'",
      "version": "v1",
      "execution_order": 1,
      "position_x": 100,
      "position_y": 100
    },
    "'"$PREPROCESSOR_ID"'": {
      "module_id": "'"$PREPROCESSOR_ID"'",
      "version": "v1",
      "execution_order": 2,
      "position_x": 300,
      "position_y": 100
    },
    "'"$TRAINER_ID"'": {
      "module_id": "'"$TRAINER_ID"'",
      "version": "v1",
      "execution_order": 3,
      "position_x": 500,
      "position_y": 100
    }
  },
  "connections": [
    {
      "from_module": "'"$DATA_LOADER_ID"'",
      "to_module": "'"$PREPROCESSOR_ID"'",
      "connection_type": "sequential"
    },
    {
      "from_module": "'"$PREPROCESSOR_ID"'",
      "to_module": "'"$TRAINER_ID"'",
      "connection_type": "sequential"
    }
  ]
}')
CANVAS_ID=$(echo $CANVAS_RESPONSE | jq -r '.canvas_id')
echo "Canvas ID: $CANVAS_ID"

# Execute Canvas
echo "Executing Canvas..."
RUN_RESPONSE=$(curl -s -X POST "$API_URL/runs/$CANVAS_ID/execute")
RUN_ID=$(echo $RUN_RESPONSE | jq -r '.run_id')
echo "Run ID: $RUN_ID"

# Wait for execution to complete
echo "Waiting for execution to complete..."
sleep 5

# Check execution status
echo "Checking execution status..."
curl -s "$API_URL/runs/$RUN_ID" | jq

# Get module statistics
echo "Getting module statistics..."
curl -s "$API_URL/runs/modules/$TRAINER_ID/stats" | jq 