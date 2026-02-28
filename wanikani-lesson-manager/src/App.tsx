import { useState } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState('Waiting for lessons...');

  return (
    <div className="wklbgh-panel" style={{
      border: '2px solid #f03', 
      padding: '20px', 
      margin: '20px', 
      backgroundColor: '#fff', 
      color: '#333',
      borderRadius: '8px',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>WKLBGH - WaniKani Lesson Based Grammar Helper</h1>
      <p style={{ marginBottom: '15px' }}><strong>Status:</strong> {status}</p>
      <button 
        onClick={() => setStatus('Scanning lessons...')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#f03',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Check Lessons
      </button>
    </div>
  );
}

export default App;
