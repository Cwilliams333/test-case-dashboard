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

# Load environment variables if .env exists
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
  echo "Loaded configuration from .env file"
else
  echo "No .env file found. Using default paths or environment variables."
  echo "Copy .env.example to .env and update paths for your system."
fi

# Use environment variables or defaults
CONFIG_DIR="${CONFIG_DIR:-/home/player2vscpu/Desktop/test-case-dashboard/Docs/dut_configurations}"
PYTHIA_CONFIG="${PYTHIA_CONFIG:-/home/player2vscpu/Desktop/test-case-dashboard/Docs/pythia.conf}"

echo ""
echo "Configuration paths:"
echo "  CONFIG_DIR: $CONFIG_DIR"
echo "  PYTHIA_CONFIG: $PYTHIA_CONFIG"
echo ""

# Confirm configuration paths exist
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
