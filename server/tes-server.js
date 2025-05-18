// Create a simple test file to check if Express itself is working
const express = require('express');
const app = express();
const PORT = 3002;

app.get('/test', (req, res) => {
  res.send('Test route working');
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});