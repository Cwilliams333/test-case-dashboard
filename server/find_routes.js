const express = require('express');
const app = express();

// Store original methods
const originalGet = app.get;
const originalPost = app.post;
const originalPut = app.put;
const originalDelete = app.delete;
const originalAll = app.all;

// Override methods to log routes
app.get = function(path, ...handlers) {
  console.log('GET Route:', path);
  return originalGet.call(this, path, ...handlers);
};

app.post = function(path, ...handlers) {
  console.log('POST Route:', path);
  return originalPost.call(this, path, ...handlers);
};

app.put = function(path, ...handlers) {
  console.log('PUT Route:', path);
  return originalPut.call(this, path, ...handlers);
};

app.delete = function(path, ...handlers) {
  console.log('DELETE Route:', path);
  return originalDelete.call(this, path, ...handlers);
};

app.all = function(path, ...handlers) {
  console.log('ALL Route:', path);
  return originalAll.call(this, path, ...handlers);
};

// Now require your server file to see all routes
require('./server');