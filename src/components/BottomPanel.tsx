import React, { useEffect, useState } from 'react';
import { FiChevronUp, FiChevronDown, FiClock, FiList } from 'react-icons/fi';
import useStore from '../store';
import './BottomPanel.css';
import { DOMAIN, ACCOUNT_ID } from '../../constants/app';

interface BottomPanelProps {
  expanded: boolean;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ expanded, run, canvasId }) => {
  const { 
    activeBottomTab,
    setActiveBottomTab,
    toggleBottomPanel,
    runs
  } = useStore();

  const [content, setContent] = useState(''); // State to hold the streamed content

  useEffect(() => {
    if (run && canvasId) {
      const fetchStream = async () => {
        try {
          const response = await fetch(`${DOMAIN}/api/v1/canvas/${canvasId}/logs`); // Replace with your URL
  
          // Check if the response is successful
          if (!response.ok) {
            console.error('Failed to fetch data:', response.status);
            // setLoading(false);
            return;
          }
  
          // Get the ReadableStream from the response body
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let chunk = '';
  
          // Read and display chunks of data
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
  
            // Decode and append the chunk
            chunk += decoder.decode(value, { stream: true });
  
            // Update the content state to render the streamed data
            setContent(prevContent => prevContent + chunk);
          }
  
          // setLoading(false); // Stream has finished loading
        } catch (error) {
          console.error('Error streaming data:', error);
          // setLoading(false);
        }
      };
      fetchStream(); 
    }
  }, [run, canvasId]);

  // console.log({ expanded, run, canvasId });

  const renderContent = () => {
    switch (activeBottomTab) {
      case 'logs':
        return (
          <div id="output">{content}</div>
        );

      case 'history':
        return (
          <div className="history">
            {Object.values(runs).map((run) => (
              <div key={run.id} className="history-item">
                <div className={`status-badge ${run.status.toLowerCase()}`}>
                  {run.status}
                </div>
                <div className="history-details">
                  <div className="history-time">
                    {new Date(run.started_at).toLocaleString()}
                  </div>
                  {run.error && (
                    <div className="history-error">
                      {run.error.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'preview':
        return (
          <div className="preview">
            {Object.values(runs).map((run) => (
              run.results && (
                <pre key={run.id} className="results-json">
                  {JSON.stringify(run.results, null, 2)}
                </pre>
              )
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const fetchHistory = () => {
    fetch(`${DOMAIN}/api/v1/canvas/${canvasId}/history`, {
      headers: {
        'Content-Type': 'application/json',
        'account-id': ACCOUNT_ID,
        accept: 'application/json',
      },
    }).then(response => response.json())
    .then(data => {
      console.log('fetch history data', { data });
    }).catch((error) => {
      console.error('Error:', error);
    });
  }

  return (
    <div className={`bottom-panel ${expanded ? 'expanded' : ''}`}>
      <div className="panel-header">
        <div className="tabs">
          <button
            className={`tab ${activeBottomTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('logs')}
          >
            <FiList className="icon" />
            <span>Logs</span>
          </button>
          <button
            className={`tab ${activeBottomTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveBottomTab('history')
              fetchHistory()
            }}
          >
            <FiClock className="icon" />
            <span>History</span>
          </button>
        </div>

        <button 
          className="btn btn-icon" 
          onClick={toggleBottomPanel}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
            <FiChevronDown className="icon" />
          ) : (
            <FiChevronUp className="icon" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="panel-content">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default BottomPanel; 