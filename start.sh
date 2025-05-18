#!/bin/bash

# This script builds the React app and starts the Express server
# Usage: ./start.sh

echo "===== Test Case Monitoring Dashboard Startup Script ====="

# Make sure we're in the project root directory
cd "$(dirname "$0")"

# Check if server directory exists
if [ ! -d "server" ]; then
  echo "Error: Server directory not found. Are you in the project root?"
  exit 1
fi

# Check for package.json in both React and server
if [ ! -f "package.json" ] || [ ! -f "server/package.json" ]; then
  echo "Error: Missing package.json files. Make sure both React app and server are set up."
  exit 1
fi

# Confirm configuration paths exist
CONFIG_DIR="/home/player3vsgpt/Documents/dut_configurations"
PYTHIA_CONFIG="/home/player3vsgpt/Documents/pythia.conf"

if [ ! -d "$CONFIG_DIR" ]; then
  echo "Warning: Device configurations directory not found at $CONFIG_DIR"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

if [ ! -f "$PYTHIA_CONFIG" ]; then
  echo "Warning: Pythia config not found at $PYTHIA_CONFIG"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Build the React app
echo "Building React application..."
npm run build
if [ $? -ne 0 ]; then
  echo "Error: Failed to build React app"
  exit 1
fi
echo "React build successful!"

# Start the server
echo "Starting server..."
cd server
node server.js
