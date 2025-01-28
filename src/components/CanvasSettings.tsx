import React, { useEffect, useState } from 'react';
import { FiSettings, FiClock, FiPlay, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import useStore from '../store';
import api from '../services/api';
import './CanvasSettings.css';

interface CanvasSettingsProps {
  canvasId: string;
}

type Tab = 'settings' | 'history';

const CanvasSettings: React.FC<CanvasSettingsProps> = ({ canvasId }) => {
  const { updateCanvas } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCanvas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.canvas.get(canvasId);
        setName(response.data.name);
        setDescription(response.data.description || '');
      } catch (err) {
        console.error('Error fetching canvas:', err);
        setError('Failed to load canvas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanvas();
  }, [canvasId]);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const response = await api.runs.list({ canvas_id: canvasId });
        setRuns(response.data);
      } catch (err) {
        console.error('Error fetching runs:', err);
      }
    };

    if (activeTab === 'history') {
      fetchRuns();
    }
  }, [canvasId, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.canvas.update(canvasId, { name, description });
      updateCanvas(canvasId, { name, description });
    } catch (err) {
      console.error('Error updating canvas:', err);
      setError('Failed to update canvas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRun = async () => {
    try {
      await api.canvas.run(canvasId);
      const response = await api.runs.list({ canvas_id: canvasId });
      setRuns(response.data);
    } catch (err) {
      console.error('Error running canvas:', err);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <FiCheck className="status-icon completed" />;
      case 'ERROR':
        return <FiX className="status-icon error" />;
      case 'RUNNING':
        return <FiLoader className="status-icon running spin" />;
      case 'PENDING':
        return <FiClock className="status-icon pending" />;
      default:
        return null;
    }
  };

  return (
    <div className="canvas-settings">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings />
          Settings
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FiClock />
          Run History
        </button>
        <button
          className="tab run-btn"
          onClick={handleRun}
        >
          <FiPlay />
          Run Pipeline
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'settings' ? (
          <div className="settings-tab">
            <h3>Canvas Settings</h3>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        ) : (
          <div className="history-tab">
            <h3>Run History</h3>
            <div className="runs-list">
              {runs.map(run => (
                <div 
                  key={run.id} 
                  className={`run-item ${run.status.toLowerCase()}`}
                >
                  <div className="run-header">
                    <div className="run-status">
                      {renderStatusIcon(run.status)}
                      {run.status}
                    </div>
                    <div className="run-time">
                      {formatTime(run.started_at)}
                    </div>
                  </div>

                  {run.error && (
                    <div className="run-error">
                      {run.error.message}
                      {run.error.details && (
                        <pre>{JSON.stringify(run.error.details, null, 2)}</pre>
                      )}
                    </div>
                  )}

                  {run.results && (
                    <div className="run-results">
                      <pre>{JSON.stringify(run.results, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasSettings; 