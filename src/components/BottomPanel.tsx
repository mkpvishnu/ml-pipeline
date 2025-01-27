import React from 'react';
import { FiChevronUp, FiChevronDown, FiClock, FiList } from 'react-icons/fi';
import useStore from '../store';

interface BottomPanelProps {
  expanded: boolean;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ expanded }) => {
  const { 
    activeBottomTab,
    setActiveBottomTab,
    toggleBottomPanel,
    runs
  } = useStore();

  const renderContent = () => {
    switch (activeBottomTab) {
      case 'logs':
        return (
          <div className="logs">
            {Object.values(runs).map((run) => (
              run.logs.map((log, index) => (
                <div key={`${run.id}-${index}`} className="log-line">
                  {log}
                </div>
              ))
            ))}
          </div>
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
            onClick={() => setActiveBottomTab('history')}
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

      <style jsx>{`
        .bottom-panel {
          background-color: var(--background-secondary);
          border-top: 1px solid var(--border-light);
          transition: height 0.2s ease;
          height: ${expanded ? '320px' : '40px'};
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px;
          height: 40px;
        }

        .tabs {
          display: flex;
          gap: 8px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 4px;
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
        }

        .tab:hover {
          background-color: var(--background-tertiary);
        }

        .tab.active {
          color: var(--text-primary);
          background-color: var(--background-tertiary);
        }

        .panel-content {
          height: calc(100% - 40px);
          overflow-y: auto;
          padding: 8px;
        }

        .logs {
          font-family: monospace;
          font-size: 12px;
          line-height: 1.4;
        }

        .log-line {
          padding: 2px 0;
          color: var(--text-secondary);
        }

        .history {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .history-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          background-color: var(--background-tertiary);
        }

        .status-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.completed {
          background-color: var(--accent-success);
          color: white;
        }

        .status-badge.running {
          background-color: var(--accent-primary);
          color: white;
        }

        .status-badge.error {
          background-color: var(--accent-error);
          color: white;
        }

        .history-details {
          flex: 1;
        }

        .history-time {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .history-error {
          margin-top: 4px;
          font-size: 12px;
          color: var(--accent-error);
        }

        .preview {
          font-family: monospace;
          font-size: 12px;
        }

        .results-json {
          padding: 8px;
          background-color: var(--background-tertiary);
          border-radius: 4px;
          overflow-x: auto;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default BottomPanel; 