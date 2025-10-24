# A2A (Agent-to-Agent) Integration

This document describes the A2A integration implemented for the Hedera Agent project.

## Overview

The Hedera Agent now supports the A2A (Agent-to-Agent) protocol, enabling it to communicate with other A2A-compliant agents in a standardized way. This integration maintains backward compatibility with the existing REST API while adding full A2A protocol support.

## Architecture

### Files Structure

```
src/
├── server.ts                 # Main A2A-enabled server
├── simpleA2AServer.ts        # A2A protocol implementation
├── simpleA2AClient.ts        # A2A client for testing
├── testSimpleA2A.ts         # A2A integration tests
├── agentCard.ts             # A2A agent card definition
├── index.ts                 # Basic server (REST API only)
└── services/
    └── hederaAgent.ts       # Hedera Agent Kit integration
```

### Key Components

1. **SimpleA2AServer**: Implements A2A protocol without external SDK dependencies
2. **SimpleA2AClient**: Client for testing A2A communication
3. **Agent Card**: Defines agent capabilities and metadata
4. **Hedera Integration**: Maintains all existing Hedera Agent Kit functionality

## A2A Protocol Implementation

### Endpoints

| Method | Endpoint                       | Description                    |
| ------ | ------------------------------ | ------------------------------ |
| GET    | `/.well-known/agent-card.json` | A2A agent card                 |
| POST   | `/a2a/sendMessage`             | Send message to agent          |
| POST   | `/a2a/sendMessageStream`       | Stream messages (SSE)          |
| GET    | `/health`                      | Health check                   |
| POST   | `/message`                     | REST API (backward compatible) |

### Message Format

#### Request Format

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "message": {
    "messageId": "uuid",
    "role": "user",
    "parts": [{ "kind": "text", "text": "Hello" }],
    "kind": "message"
  }
}
```

#### Response Format

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    "kind": "message",
    "messageId": "uuid",
    "role": "agent",
    "parts": [{ "kind": "text", "text": "Response" }],
    "contextId": "uuid"
  }
}
```

### Streaming Format

The streaming endpoint uses Server-Sent Events (SSE) with the following event types:

- `task`: Task creation and status
- `status-update`: Task status changes
- `message`: Agent responses
- `artifact-update`: File or data artifacts

## Usage

### Starting the Server

```bash
# Start A2A-enabled server
npm run dev

# Start basic server (REST API only)
npm run dev:basic
```

### Testing A2A Integration

```bash
# Run A2A integration tests
npm run a2a:test
```

### Client Usage

```typescript
import { SimpleA2AClient } from "./simpleA2AClient";

const client = new SimpleA2AClient("http://localhost:3000");

// Get agent card
const card = await client.getAgentCard();

// Send message
const response = await client.sendMessage("Hello, agent!");

// Stream messages
const stream = await client.sendMessageStream("Tell me about Hedera");
for await (const event of stream) {
  console.log(event);
}
```

## Agent Card

The agent card defines the agent's capabilities and is available at `/.well-known/agent-card.json`:

```json
{
  "name": "Hedera Network Agent",
  "description": "A specialized agent for Hedera network operations",
  "protocolVersion": "0.3.0",
  "version": "1.0.0",
  "url": "http://localhost:3000/",
  "skills": [
    {
      "id": "hedera-operations",
      "name": "Hedera Operations",
      "description": "Perform operations on the Hedera network",
      "tags": ["blockchain", "hedera", "cryptocurrency"]
    },
    {
      "id": "did-generation",
      "name": "DID Generation",
      "description": "Generate decentralized identifiers",
      "tags": ["did", "identity", "ssi"]
    }
  ],
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": true
  }
}
```

## Features

### ✅ Implemented

- **A2A Protocol Compliance**: Full A2A protocol implementation
- **Agent Card**: Standardized agent metadata
- **Message Handling**: JSON-RPC 2.0 compatible responses
- **Streaming Support**: Server-Sent Events for real-time communication
- **Task Management**: Proper task lifecycle (submitted → working → completed)
- **Error Handling**: A2A-compliant error responses
- **Backward Compatibility**: Original REST API preserved
- **Hedera Integration**: All Hedera Agent Kit functionality maintained

### 🔄 Task Lifecycle

1. **Submitted**: Task is created and queued
2. **Working**: Agent is processing the request
3. **Completed**: Task finished successfully
4. **Failed**: Task encountered an error
5. **Canceled**: Task was cancelled by user

### 📡 Streaming Events

- **Task Events**: Task creation and updates
- **Status Updates**: Task state changes
- **Message Events**: Agent responses
- **Artifact Events**: File or data outputs

## Error Handling

The implementation includes comprehensive error handling with proper A2A error codes:

- `-32602`: Invalid message format
- `-32603`: Internal server error
- `-32601`: Method not found
- `-32700`: Parse error

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Run A2A tests
npm run a2a:test

# Test individual components
npm run dev:basic  # Basic server
npm run dev        # A2A server
```

### Environment Variables

```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=your_account_id
HEDERA_PRIVATE_KEY=your_private_key

# OpenAI Configuration
OPENAI_API_KEY=your_api_key

# Server Configuration
PORT=3000
AGENT_URL=http://localhost:3000
```

## Benefits

1. **Interoperability**: Communicate with other A2A-compliant agents
2. **Standardization**: Follows official A2A protocol specification
3. **Real-time Communication**: Streaming support for long-running tasks
4. **Task Management**: Proper handling of complex operations
5. **Error Handling**: Standardized error responses
6. **Backward Compatibility**: Existing integrations continue to work

## Future Enhancements

- [ ] Full A2A SDK integration (when module resolution issues are resolved)
- [ ] Push notifications for long-running tasks
- [ ] Advanced task cancellation
- [ ] Multi-agent orchestration
- [ ] Enhanced error recovery

## Troubleshooting

### Common Issues

1. **Module Resolution**: If A2A SDK imports fail, use the simple implementation
2. **Port Conflicts**: Ensure port 3000 is available
3. **Environment Variables**: Verify all required environment variables are set
4. **Network Issues**: Check firewall settings for streaming endpoints

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=a2a:*
```

## Support

For issues related to A2A integration, check:

1. Server logs for error messages
2. Agent card endpoint: `GET /.well-known/agent-card.json`
3. Health endpoint: `GET /health`
4. Test suite: `npm run a2a:test`
