#!/bin/bash

# Zomato Agent UI Development Startup Script
echo "🚀 Starting Zomato Agent UI on port 5173..."

# Set environment variables
export PORT=5173
export REACT_APP_AGENT_URL=http://localhost:3000
export REACT_APP_AGENT_DID=did:iden3:polygon:amoy:your-agent-did-here
export REACT_APP_DEBUG=true

# Start the development server
npm start
