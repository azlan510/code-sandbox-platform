import { useState } from 'react'
import './App.css'

function App() {
  const [code, setCode] = useState('console.log("Hello from the frontend!");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    setOutput('Sending to cloud engine...');
    
    try {
      const response = await fetch('https://code-sandbox-platform.onrender.com/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, code }),
      });

      const data = await response.json();
      
      // Adjust 'data.output' based on exactly what your backend sends back
      if (response.ok) {
        setOutput(data.output || JSON.stringify(data)); 
      } else {
        setOutput(`Error: ${data.error || 'Execution failed'}`);
      }
    } catch (error) {
      setOutput('Critical failure: Could not connect to the cloud backend.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="sandbox-container">
      <header>
        <h1>AI Code Sandbox</h1>
        <div className="controls">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <button 
            onClick={handleExecute} 
            disabled={isExecuting}
            className={isExecuting ? 'running' : ''}
          >
            {isExecuting ? 'Executing...' : 'Run Code'}
          </button>
        </div>
      </header>

      <main className="editor-workspace">
        <div className="editor-pane">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            placeholder="Write your code here..."
          />
        </div>
        
        <div className="output-pane">
          <h3>Terminal Output</h3>
          <pre>{output}</pre>
        </div>
      </main>
    </div>
  )
}

export default App