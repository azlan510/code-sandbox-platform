import { useState, useEffect } from 'react'
import './App.css'

const TEMPLATES = {
  javascript: 'console.log("Hello from JavaScript!");',
  python: 'print("Hello from Python!")',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}'
};

function App() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(TEMPLATES.javascript);
  const [output, setOutput] = useState('// Output will appear here...');
  const [isExecuting, setIsExecuting] = useState(false);

  // Auto-switch boilerplate code when language changes
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(TEMPLATES[newLang]);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setOutput('Compiling and executing in the cloud...');
    
    try {
      const response = await fetch('https://code-sandbox-platform.onrender.com/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });

      const data = await response.json();
      
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
      <div className="glass-panel">
        <header>
          <div className="mac-buttons">
            <span></span><span></span><span></span>
          </div>
          <h1>AI Code Sandbox <span>Pro</span></h1>
          <div className="controls">
            <select value={language} onChange={handleLanguageChange}>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3</option>
              <option value="c">C (GCC)</option>
              <option value="java">Java</option>
            </select>
            <button 
              onClick={handleExecute} 
              disabled={isExecuting}
              className={isExecuting ? 'running' : ''}
            >
              {isExecuting ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </header>

        <main className="editor-workspace">
          <div className="editor-pane pane">
            <div className="pane-header">main.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'c'}</div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />
          </div>
          
          <div className="output-pane pane">
            <div className="pane-header">Terminal</div>
            <pre>{output}</pre>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App