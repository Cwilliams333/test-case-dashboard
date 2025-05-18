const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Define paths to your configuration files
const CONFIG_DIR = '/home/player3vsgpt/Documents/dut_configurations';
const PYTHIA_CONFIG_PATH = '/home/player3vsgpt/Documents/pythia.conf';

// Function to determine the correct manufacturer based on model name
const categorizeManufacturer = (modelName) => {
  const modelNameLower = modelName.toLowerCase();
  
  if (modelNameLower.includes('iphone') || modelNameLower.includes('ipad') || modelNameLower.includes('apple')) {
    return 'Apple';
  } else if (modelNameLower.includes('pixel')) {
    return 'Google';
  } else if (
    modelNameLower.includes('galaxy') || 
    modelNameLower.includes('sm-') ||
    /^samsung (a|s)[0-9]/i.test(modelNameLower) ||
    /^a[0-9]+/i.test(modelNameLower) ||
    /^s[0-9]+/i.test(modelNameLower)
  ) {
    return 'Samsung';
  } else if (modelNameLower.includes('motorola') || modelNameLower.includes('moto')) {
    return 'Motorola';
  } else if (modelNameLower.includes('tcl')) {
    return 'TCL';
  } else {
    return 'Other';
  }
};

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// IMPORTANT: Properly serve static files from the build directory
// This should come BEFORE the API routes
app.use(express.static(path.join(__dirname, '../build'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
// API endpoints
app.get('/api', (req, res) => {
  res.json({
    message: 'API is running',
    endpoints: [
      { path: '/api/devices', description: 'Get all devices' },
      { path: '/api/pythia-config', description: 'Get Pythia configuration' },
      { path: '/api/device?model=[modelName]', description: 'Get device configuration by model name' }
    ]
  });
});

// API endpoint to get all manufacturers and models
app.get('/api/devices', (req, res) => {
  try {
    // Initialize with our predefined manufacturers
    const devices = {
      'Apple': [],
      'Google': [],
      'Samsung': [],
      'Motorola': [],
      'TCL': [],
      'Other': []
    };
    
    const files = fs.readdirSync(CONFIG_DIR);
    
    files.forEach(file => {
      if (file.endsWith('.ini')) {
        try {
          const content = fs.readFileSync(path.join(CONFIG_DIR, file), 'utf8');
          const nameMatch = content.match(/Name\s*=\s*(.+)/);
          
          if (nameMatch) {
            const fullName = nameMatch[1].trim();
            // Create a formatted name that includes the model code (filename without extension)
            const modelCode = file.replace('.ini', '');
            const formattedName = `${fullName} (${modelCode})`;
            
            // Use the categorization function
            const manufacturer = categorizeManufacturer(fullName);
            
            // Add to the appropriate manufacturer list
            if (!devices[manufacturer].includes(formattedName)) {
              devices[manufacturer].push(formattedName);
            }
          }
        } catch (readError) {
          console.error(`Error reading ${file}:`, readError);
        }
      }
    });
    
    // Remove any empty manufacturer categories
    Object.keys(devices).forEach(key => {
      if (devices[key].length === 0) {
        delete devices[key];
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

// API endpoint to get device configuration using query parameter
app.get('/api/device', (req, res) => {
  try {
    const modelName = req.query.model;
    
    if (!modelName) {
      return res.status(400).json({ error: 'Model name is required as a query parameter' });
    }
    
    // Extract the model code from the formatted name if it exists
    let searchModelName = modelName;
    const modelCodeMatch = modelName.match(/^(.+) \(([^)]+)\)$/);
    if (modelCodeMatch) {
      // If we have a formatted name with model code, use the model code to find the file
      const modelCode = modelCodeMatch[2];
      const fileName = `${modelCode}.ini`;
      
      if (fs.existsSync(path.join(CONFIG_DIR, fileName))) {
        const content = fs.readFileSync(path.join(CONFIG_DIR, fileName), 'utf8');
        return res.send(content);
      }
      
      // If we can't find by model code, fall back to searching by the full name
      searchModelName = modelCodeMatch[1];
    }
    
    // Search through all files if we couldn't find by direct model code
    const files = fs.readdirSync(CONFIG_DIR);
    let configContent = null;
    
    // Find the file that contains this model
    for (const file of files) {
      if (file.endsWith('.ini')) {
        try {
          const content = fs.readFileSync(path.join(CONFIG_DIR, file), 'utf8');
          if (content.includes(`Name = ${searchModelName}`)) {
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

// This should be AFTER all API routes
// Handle all other GET requests by serving the React app
app.get('*', (req, res) => {
  // Check if the request is for an API endpoint
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Otherwise serve the React app
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving from config directory: ${CONFIG_DIR}`);
  console.log(`Access your dashboard at http://localhost:${PORT}`);
  console.log(`Access API at http://localhost:${PORT}/api`);
});