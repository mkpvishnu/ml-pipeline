import React, { useEffect, useState, useRef } from 'react';
import { FiChevronUp, FiChevronDown, FiClock, FiList } from 'react-icons/fi';
import useStore from '../store';
import './BottomPanel.css';
import { DOMAIN, ACCOUNT_ID } from '../../constants/app';

interface BottomPanelProps {
  expanded: boolean;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ expanded, run, canvasId, history, setHistory }) => {
  const { 
    activeBottomTab,
    setActiveBottomTab,
    toggleBottomPanel,
    runs
  } = useStore();

  const [content, setContent] = useState(''); // State to hold the streamed content
  
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef(null); // Use ref to store interval ID

  useEffect(() => {
    if (run && canvasId) {
      const fetchStream = async () => {
        try {
          // const response = await fetch(`${DOMAIN}/api/v1/stream/${run}/stream`); // Replace with your URL
          const response = await fetch(`https://freddy-ml-pipeline-freshflow.cxbu.staging.freddyproject.com/api/workflow/${run}/stream`); // Replace with your URL
  
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

  useEffect(() => {
    const fetchHistory = () => {
      // fetch(`${DOMAIN}api/v1/stream/${run}/status`, {
      fetch(`https://freddy-ml-pipeline-freshflow.cxbu.staging.freddyproject.com/api/workflow/${run}/status`, {
        headers: {
          "Content-Type": "application/json",
          "account-id": ACCOUNT_ID,
          accept: "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log('fetch history data', { data });
          setHistory([]);
          console.log(`WORKFLOW STATUS ----- ${data.status}`);

          if (data.status === "COMPLETED" || data.status === "FAILED") {
            setIsCompleted(true);
            clearInterval(intervalRef.current); // Correctly clear interval
            intervalRef.current = null; // Reset ref
            console.log('cleared');
          } else {
            setHistory((prevHistory) => [
              ...prevHistory,
              ...Object.entries(data.modules).map(([key, value]) => `${key}: ${value.status}`),
            ]);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          setHistory((prevHistory) => [...prevHistory, "Error fetching data"]);
        });
    };

    if (run && canvasId && !intervalRef.current) {
      intervalRef.current = setInterval(fetchHistory, 1000);
      fetchHistory(); // Call immediately instead of waiting 1 second
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [run, canvasId]);

  const renderContent = () => {
    switch (activeBottomTab) {
      case 'logs':
        return (
          <pre>
            <div id="output">{content}</div>
          </pre>
        );

      case 'history':
        return (
          <div className="history">
            <pre>
              {history?.map((h, index) => (
                <div key={index}>{h}</div>
              ))}
            </pre>
          {isCompleted && <p>Process Completed ✅</p>}
          </div>
        );
      // case 'preview':
      //   return (
      //     <div className="preview">
      //       {Object.values(runs).map((run) => (
      //         run.results && (
      //           <pre key={run.id} className="results-json">
      //             {JSON.stringify(run.results, null, 2)}
      //           </pre>
      //         )
      //       ))}
      //     </div>
      //   );

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
            onClick={() => {
              setActiveBottomTab('history')
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