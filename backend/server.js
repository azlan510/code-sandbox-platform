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
  // MATCHED TO FRONTEND: changed source_code to code
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
  }

  // 1. Create a unique temporary file
  const extension = language === 'python' ? 'py' : 'js';
  const fileName = `temp_${Date.now()}.${extension}`;
  const filePath = path.join(__dirname, fileName);

  try {
    // 2. Write the user's code into the file
    fs.writeFileSync(filePath, code);

    // 3. Determine how to run it based on the language
    const command = language === 'python' ? `python "${filePath}"` : `node "${filePath}"`;

    // 4. Execute the file securely on your machine
    exec(command, (error, stdout, stderr) => {
      // Always delete the temporary file after running it to keep the server clean
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      // If the user's code has an error (like a typo), send the error back
      if (error) {
        return res.status(200).json({ output: stderr || error.message });
      }
      
      // If successful, send the output back
      res.status(200).json({ output: stdout });
    });

  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: "Server execution failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running smoothly on port ${PORT}`);
});