import React, { useEffect, useState } from 'react';
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

  let intervalId;

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
          setHistory([]);
          console.log('fetch history data', { data });
          Object.entries(data.modules).forEach(([key, value]) => {
            console.log(`${key} ----- ${value.status}`);
            setHistory((prevHistory) => [...prevHistory, `${key}: ${value.status}`]);
          });

          if (data.status === "COMPLETED") {
            setIsCompleted(true);
            clearInterval(intervalId);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          setHistory((prevHistory) => [...prevHistory, "Error fetching data"]);
        });
    };

    if (run && canvasId) {
      intervalId = setInterval(fetchHistory, 5000);
    }

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
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