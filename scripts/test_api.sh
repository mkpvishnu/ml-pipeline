#!/bin/bash

# Exit on error
set -e

API_URL="http://localhost:8000/api/v1"
ACCOUNT_ID=1
COUNTER=0

# Function to check response
check_response() {
    local response=$1
    local error_msg=$2
    if echo "$response" | jq -e 'has("detail")' > /dev/null; then
        echo "Error: $error_msg"
        echo "Response: $response"
        exit 1
    fi
}

# Create Data Loader Module
echo "Creating Data Loader module..."
DATA_LOADER_RESPONSE=$(curl -s -X POST "$API_URL/modules/" \
-H "Content-Type: application/json" \
-d '{
  "name": "Data Loader",
  "type": "python",
  "description": "Loads sample data",
  "account_id": '"$ACCOUNT_ID"',
  "category": "data"
}')
check_response "$DATA_LOADER_RESPONSE" "Failed to create Data Loader module"
DATA_LOADER_ID=$(echo $DATA_LOADER_RESPONSE | jq -r '.module_id')
echo "Data Loader ID: $DATA_LOADER_ID"

# Create Data Loader Version
echo "Creating Data Loader version..."
DATA_LOADER_VERSION_RESPONSE=$(curl -s -X POST "$API_URL/modules/$DATA_LOADER_ID/versions" \
-H "Content-Type: application/json" \
-d '{
  "version": "v1",
  "module_id": "'"$DATA_LOADER_ID"'",
  "code": "import pandas as pd\nimport numpy as np\n\n# Create sample data\ndata = pd.DataFrame({\n    \"feature1\": np.random.rand(100),\n    \"feature2\": np.random.rand(100),\n    \"target\": np.random.randint(0, 2, 100)\n})\n\n# Store data in context\ncontext.set_var(\"training_data\", data)\ncached_results = [\"data\"]\nlogger.info(f\"Data shape: {data.shape}\")"
}')
check_response "$DATA_LOADER_VERSION_RESPONSE" "Failed to create Data Loader version"
echo "$DATA_LOADER_VERSION_RESPONSE"

# Create Preprocessor Module
echo "Creating Preprocessor module..."
PREPROCESSOR_RESPONSE=$(curl -s -X POST "$API_URL/modules/" \
-H "Content-Type: application/json" \
-d '{
  "name": "Preprocessor",
  "type": "python",
  "description": "Standardizes features",
  "account_id": '"$ACCOUNT_ID"',
  "category": "preprocessing"
}')
check_response "$PREPROCESSOR_RESPONSE" "Failed to create Preprocessor module"
PREPROCESSOR_ID=$(echo $PREPROCESSOR_RESPONSE | jq -r '.module_id')
echo "Preprocessor ID: $PREPROCESSOR_ID"

# Create Preprocessor Version
echo "Creating Preprocessor version..."
PREPROCESSOR_VERSION_RESPONSE=$(curl -s -X POST "$API_URL/modules/$PREPROCESSOR_ID/versions" \
-H "Content-Type: application/json" \
-d '{
  "version": "v1",
  "module_id": "'"$PREPROCESSOR_ID"'",
  "code": "data = context.get_var(\"training_data\")\n\nfrom sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\nfeatures = [\"feature1\", \"feature2\"]\ndata[features] = scaler.fit_transform(data[features])\n\ncontext.set_var(\"processed_data\", data)\ncontext.set_var(\"scaler\", scaler)\ncached_results = [\"data\", \"scaler\"]\nlogger.info(f\"Preprocessed data shape: {data.shape}\")"
}')
check_response "$PREPROCESSOR_VERSION_RESPONSE" "Failed to create Preprocessor version"
echo "$PREPROCESSOR_VERSION_RESPONSE"

# Create Training Module
echo "Creating Training module..."
TRAINER_RESPONSE=$(curl -s -X POST "$API_URL/modules/" \
-H "Content-Type: application/json" \
-d '{
  "name": "Model Trainer",
  "type": "python",
  "description": "Trains logistic regression model",
  "account_id": '"$ACCOUNT_ID"',
  "category": "training"
}')
check_response "$TRAINER_RESPONSE" "Failed to create Training module"
TRAINER_ID=$(echo $TRAINER_RESPONSE | jq -r '.module_id')
echo "Trainer ID: $TRAINER_ID"

# Create Training Version
echo "Creating Training version..."
TRAINER_VERSION_RESPONSE=$(curl -s -X POST "$API_URL/modules/$TRAINER_ID/versions" \
-H "Content-Type: application/json" \
-d '{
  "version": "v1",
  "module_id": "'"$TRAINER_ID"'",
  "code": "from sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\n\ndata = context.get_var(\"processed_data\")\n\nfeatures = [\"feature1\", \"feature2\"]\nX = data[features]\ny = data[\"target\"]\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)\n\ntrain_score = model.score(X_train, y_train)\ntest_score = model.score(X_test, y_test)\n\ncontext.set_var(\"model\", model)\ncontext.set_var(\"model_scores\", {\"train_score\": train_score, \"test_score\": test_score})\ncached_results = [\"model\", \"model_scores\"]\nlogger.info(f\"Train score: {train_score:.3f}, Test score: {test_score:.3f}\")"
}')
check_response "$TRAINER_VERSION_RESPONSE" "Failed to create Training version"
echo "$TRAINER_VERSION_RESPONSE"

# Create Canvas
echo "Creating Canvas..."
CANVAS_RESPONSE=$(curl -s -X POST "$API_URL/canvases?account_id=$ACCOUNT_ID" \
-H "Content-Type: application/json" \
-d '{
  "name": "Training Pipeline",
  "description": "Sample ML training pipeline",
  "version": "v1",
  "module_config": {
    "'"$DATA_LOADER_ID"'": {
      "module_id": "'"$DATA_LOADER_ID"'",
      "version": "v1",
      "execution_order": 1
    },
    "'"$PREPROCESSOR_ID"'": {
      "module_id": "'"$PREPROCESSOR_ID"'",
      "version": "v1",
      "execution_order": 2
    },
    "'"$TRAINER_ID"'": {
      "module_id": "'"$TRAINER_ID"'",
      "version": "v1",
      "execution_order": 3
    }
  }
}')
check_response "$CANVAS_RESPONSE" "Failed to create canvas"
CANVAS_ID=$(echo $CANVAS_RESPONSE | jq -r '.canvas_id')
echo "Canvas ID: $CANVAS_ID"

# Add modules to canvas
echo "Adding modules to canvas..."
for MODULE_ID in "$DATA_LOADER_ID" "$PREPROCESSOR_ID" "$TRAINER_ID"; do
    POSITION_X=$((100 + 200 * COUNTER))
    RESPONSE=$(curl -s -X POST "$API_URL/canvases/$CANVAS_ID/modules" \
    -H "Content-Type: application/json" \
    -d '{
      "module_id": "'"$MODULE_ID"'",
      "version": "v1",
      "position_x": '"$POSITION_X"',
      "position_y": 100
    }')
    check_response "$RESPONSE" "Failed to add module $MODULE_ID to canvas"
    echo "Added module $MODULE_ID: $RESPONSE"
    COUNTER=$((COUNTER + 1))
done

# Create a new run
echo "Creating a new run..."
RUN_RESPONSE=$(curl -s -X POST "$API_URL/runs/canvas/$CANVAS_ID/run" \
-H "Content-Type: application/json")
check_response "$RUN_RESPONSE" "Failed to create run"
RUN_ID=$(echo $RUN_RESPONSE | jq -r '.run_id')
echo "Run ID: $RUN_ID"

# Execute Canvas
echo "Executing Canvas..."
EXECUTE_RESPONSE=$(curl -s -X POST "$API_URL/runs/$RUN_ID/execute" \
-H "Content-Type: application/json")
check_response "$EXECUTE_RESPONSE" "Failed to execute canvas"
echo "Execution started"

# Wait for execution to complete
echo "Waiting for execution to complete..."
for i in {1..12}; do
    sleep 5
    STATUS_RESPONSE=$(curl -s -X GET "$API_URL/runs/$RUN_ID")
    STATUS=$(echo $STATUS_RESPONSE | jq -r '.status')
    echo "Current status: $STATUS"
    if [[ "$STATUS" == "completed" || "$STATUS" == "failed" ]]; then
        break
    fi
done

# Check final execution status
echo "Final execution status:"
curl -s -X GET "$API_URL/runs/$RUN_ID" | jq '.'

# Get module statistics
echo "Getting module statistics..."
curl -s -X GET "$API_URL/runs/modules/$TRAINER_ID/stats" | jq '.' 