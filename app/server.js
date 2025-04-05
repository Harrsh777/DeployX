// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// GitHub repo download endpoint
app.post('/api/github-clone', async (req, res) => {
  const { repoUrl } = req.body;
  
  try {
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const tempDir = path.join(__dirname, 'temp', repoName);
    
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    
    await simpleGit().clone(repoUrl, tempDir);
    
    // Read all files and send to frontend
    const files = [];
    const readFiles = (dir) => {
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          readFiles(fullPath);
        } else if (!file.includes('node_modules') && !file.includes('.git')) {
          files.push({
            name: path.relative(tempDir, fullPath),
            content: fs.readFileSync(fullPath, 'utf-8')
          });
        }
      });
    };
    
    readFiles(tempDir);
    res.json({ files });
    
    // Cleanup after 5 minutes
    setTimeout(() => {
      fs.rmSync(tempDir, { recursive: true });
    }, 300000);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Docker build endpoint
app.post('/api/docker-build', async (req, res) => {
  const { dockerfile, files } = req.body;
  const buildDir = path.join(__dirname, 'temp', `build-${Date.now()}`);
  
  try {
    fs.mkdirSync(buildDir, { recursive: true });
    
    // Save all files
    files.forEach(file => {
      const filePath = path.join(buildDir, file.name);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.content);
    });
    
    // Save Dockerfile
    fs.writeFileSync(path.join(buildDir, 'Dockerfile'), dockerfile);
    
    // Execute docker build
    exec(`docker build -t my-app ${buildDir}`, (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({ error: stderr });
      } else {
        res.json({ output: stdout, imageId: 'my-app' });
      }
      
      // Cleanup
      fs.rmSync(buildDir, { recursive: true });
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));