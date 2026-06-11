process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB is Successfully Connected!'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('The AI Code Sandbox Backend is Live!');
});

// --- MATCHED TO FRONTEND: changed from /submit to /execute ---
app.post('/execute', (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
  }

  // 1. Create a unique temporary directory for isolation
  const id = Date.now();
  const tempDir = path.join(__dirname, `temp_${id}`);
  fs.mkdirSync(tempDir, { recursive: true });

  let filePath, command;

  try {
    // 2. Setup the correct file and compilation commands
    if (language === 'javascript') {
      filePath = path.join(tempDir, 'script.js');
      fs.writeFileSync(filePath, code);
      command = `node "${filePath}"`;
      
    } else if (language === 'python') {
      filePath = path.join(tempDir, 'script.py');
      fs.writeFileSync(filePath, code);
      command = `python "${filePath}"`;
      
    } else if (language === 'c') {
      filePath = path.join(tempDir, 'main.c');
      const outPath = path.join(tempDir, 'main.out');
      fs.writeFileSync(filePath, code);
      // Compile with GCC, then execute the binary
      command = `gcc "${filePath}" -o "${outPath}" && "${outPath}"`;
      
    } else if (language === 'java') {
      // Java requires the file name to match the public class name (Main.java)
      filePath = path.join(tempDir, 'Main.java');
      fs.writeFileSync(filePath, code);
      // Change directory into the temp folder, compile, and run
      command = `cd "${tempDir}" && javac Main.java && java Main`;
      
    } else {
      return res.status(400).json({ error: "Unsupported language." });
    }

    // 3. Execute with a 5-second timeout to prevent infinite loops from crashing the server
    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      // Cleanup: Instantly delete the unique directory and its contents
      fs.rmSync(tempDir, { recursive: true, force: true });

      if (error) {
        if (error.killed) return res.status(200).json({ output: "Execution Timeout: Code took longer than 5 seconds." });
        return res.status(200).json({ output: stderr || error.message });
      }
      
      res.status(200).json({ output: stdout });
    });

  } catch (err) {
    // Failsafe cleanup
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    res.status(500).json({ error: "Server execution failed." });
  }
});