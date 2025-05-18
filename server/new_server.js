const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Define paths to your configuration files
const CONFIG_DIR = '/home/player3vsgpt/Documents/dut_configurations';
const PYTHIA_CONFIG_PATH = '/home/player3vsgpt/Documents/pythia.conf';

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Test route to make sure server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// API endpoint to get all manufacturers and models
app.get('/api/devices', (req, res) => {
  try {
    const devices = {};
    const files = fs.readdirSync(CONFIG_DIR);
    
    files.forEach(file => {
      if (file.endsWith('.ini')) {
        try {
          const content = fs.readFileSync(path.join(CONFIG_DIR, file), 'utf8');
          const nameMatch = content.match(/Name\s*=\s*(.+)/);
          
          if (nameMatch) {
            const fullName = nameMatch[1].trim();
            const parts = fullName.split(' ');
            if (parts.length > 0) {
              const manufacturer = parts[0];
              
              if (!devices[manufacturer]) {
                devices[manufacturer] = [];
              }
              
              devices[manufacturer].push(fullName);
            }
          }
        } catch (readError) {
          console.error(`Error reading ${file}:`, readError);
        }
      }
    });
    
    res.json(devices);
  } catch (error) {
    console.error('Error scanning devices:', error);
    res.status(500).json({ error: 'Failed to scan devices' });
  }
});

// API endpoint to get Pythia config
app.get('/api/pythia-config', (req, res) => {
  try {
    const content = fs.readFileSync(PYTHIA_CONFIG_PATH, 'utf8');
    const lines = content.split('\n');
    const mapping = [];
    
    lines.forEach(line => {
      if (!line.trim() || line.trim().startsWith('#')) return;
      
      const match = line.match(/([a-zA-Z0-9\.]+)\s*=\s*(.+)/);
      if (match) {
        mapping.push([match[1].trim(), match[2].trim()]);
      }
    });
    
    res.json(mapping);
  } catch (error) {
    console.error('Error reading Pythia config:', error);
    res.status(500).json({ error: 'Failed to read Pythia config' });
  }
});

// Use query parameter instead of route parameter
app.get('/api/device', (req, res) => {
  try {
    const modelName = req.query.model;
    
    if (!modelName) {
      return res.status(400).json({ error: 'Model name is required' });
    }
    
    const files = fs.readdirSync(CONFIG_DIR);
    let configContent = null;
    
    // Find the file that contains this model
    for (const file of files) {
      if (file.endsWith('.ini')) {
        try {
          const content = fs.readFileSync(path.join(CONFIG_DIR, file), 'utf8');
          if (content.includes(`Name = ${modelName}`)) {
            configContent = content;
            break;
          }
        } catch (readError) {
          console.error(`Error reading ${file}:`, readError);
        }
      }
    }
    
    if (configContent) {
      res.send(configContent);
    } else {
      res.status(404).json({ error: 'Device configuration not found' });
    }
  } catch (error) {
    console.error('Error reading device config:', error);
    res.status(500).json({ error: 'Failed to read device configuration' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving from config directory: ${CONFIG_DIR}`);
});