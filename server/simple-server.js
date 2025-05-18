const express = require('express');
const app = express();
const PORT = 3001;

// Just simple routes for testing
app.get('/api/simple', (req, res) => {
  res.json({message: 'Simple route working'});
});

app.get('/api/device', (req, res) => {
  const model = req.query.model;
  res.json({message: `Looking for model: ${model}`});
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});