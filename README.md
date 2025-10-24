# Zkred Wiki Agent

A TypeScript-based API service that provides AI-powered interactions with the Hedera network using LangChain and the Hedera Agent Kit. Now with **A2A (Agent-to-Agent) protocol support** for standardized agent communication and **Wikipedia research capabilities**.

## 🚀 Features

- **Hedera Network Integration**: Full support for Hedera operations via Hedera Agent Kit
- **AI-Powered**: Uses OpenAI GPT models for intelligent responses
- **Wikipedia Research**: Conduct research using Wikipedia API for comprehensive information
- **A2A Protocol**: Agent-to-Agent communication standard compliance
- **Streaming Support**: Real-time communication with Server-Sent Events
- **REST API**: Backward compatible REST endpoints
- **DID Generation**: Zkred Agent ID plugin integration

## Installation

1. Clone the repository:

```bash
git clone git@github.com:Zkred/hedera-agent-a.git
cd hedera-agent-ethonline
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=your_private_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration (optional)
PORT=3000
```

## Development

### Run in development mode:

```bash
# A2A-enabled server (recommended)
npm run dev

# Basic server (REST API only)
npm run dev:basic
```

### Build the project:

```bash
npm run build
```

### Run the production build:

```bash
npm start
```

### Test A2A Integration:

```bash
npm run a2a:test
```

## API Endpoints

### REST API (Backward Compatible)

- **GET** `/health` - Health check
- **POST** `/message` - Send message (REST format)

### A2A Protocol Endpoints

- **GET** `/.well-known/agent-card.json` - Agent capabilities and metadata
- **POST** `/a2a/sendMessage` - Send message (A2A format with JSON-RPC 2.0)
- **POST** `/a2a/sendMessageStream` - Stream messages (Server-Sent Events for real-time responses)

### A2A Agent Card

The agent card defines capabilities and is available at `/.well-known/agent-card.json`:

```json
{
  "name": "Zkred Wiki Agent",
  "description": "A specialized agent that can interact with the Hedera network, generate DIDs, perform blockchain operations using the Hedera Agent Kit, and conduct research using Wikipedia.",
  "skills": [
    {
      "id": "hedera-operations",
      "name": "Hedera Operations",
      "description": "Perform operations on the Hedera network including account queries, token operations, and smart contract interactions",
      "tags": ["blockchain", "hedera", "cryptocurrency", "defi"]
    },
    {
      "id": "did-generation",
      "name": "DID Generation",
      "description": "Generate decentralized identifiers using Zkred Agent ID plugin for identity management",
      "tags": ["did", "identity", "ssi", "privacy"]
    },
    {
      "id": "research",
      "name": "Wiki Tool",
      "description": "Conduct research using Wikipedia and provide information on various topics",
      "tags": ["research", "wikipedia", "information", "knowledge"]
    },
    {
      "id": "chat",
      "name": "Chat",
      "description": "General conversation and assistance with Hedera-related questions",
      "tags": ["chat", "assistant", "support"]
    }
  ],
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": true
  }
}
```

## Example Usage

### REST API Examples

```bash
# Health check
curl http://localhost:3000/health

# Send a message (REST format)
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message": "what'\''s my balance?"}'
```

### A2A Protocol Examples

#### Get Agent Card

```bash
curl http://localhost:3000/.well-known/agent-card.json
```

#### Send A2A Message (Standard)

```bash
curl -X POST http://localhost:3000/a2a/sendMessage \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "message": {
      "messageId": "test-123",
      "role": "user",
      "parts": [{"kind": "text", "text": "Hello, agent!"}],
      "contextId": "ctx-456"
    }
  }'
```

#### Send A2A Message with Hedera Query

```bash
curl -X POST http://localhost:3000/a2a/sendMessage \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "2",
    "message": {
      "messageId": "hedera-123",
      "role": "user",
      "parts": [{"kind": "text", "text": "What is my Hedera account balance?"}],
      "contextId": "ctx-457"
    }
  }'
```

#### Send A2A Message with Wikipedia Research

```bash
curl -X POST http://localhost:3000/a2a/sendMessage \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "3",
    "message": {
      "messageId": "wiki-123",
      "role": "user",
      "parts": [{"kind": "text", "text": "Research quantum computing on Wikipedia"}],
      "contextId": "ctx-458"
    }
  }'
```

#### Send A2A Message with DID Generation

```bash
curl -X POST http://localhost:3000/a2a/sendMessage \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "4",
    "message": {
      "messageId": "did-123",
      "role": "user",
      "parts": [{"kind": "text", "text": "Generate a new DID for me"}],
      "contextId": "ctx-459"
    }
  }'
```

#### Stream A2A Messages (Server-Sent Events)

```bash
curl -X POST http://localhost:3000/a2a/sendMessageStream \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": "5",
    "message": {
      "messageId": "stream-123",
      "role": "user",
      "parts": [{"kind": "text", "text": "Research blockchain technology and explain how Hedera works"}],
      "contextId": "ctx-460"
    }
  }'
```

#### A2A Response Format

The agent responds with JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    "kind": "message",
    "messageId": "agent-msg-123",
    "role": "agent",
    "parts": [
      {
        "kind": "text",
        "text": "Agent response here..."
      }
    ],
    "contextId": "ctx-456"
  }
}
```

### Using JavaScript fetch:

```javascript
const response = await fetch("http://localhost:3000/message", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message:
      "generate an agent DID for my account: 0xfd885bf080abffe1dcde1f88782fc4007b5207e5 for Privado Main",
  }),
});

const data = await response.json();
console.log(data.response);
```

### A2A Client Usage

```javascript
import { SimpleA2AClient } from "./src/simpleA2AClient";

const client = new SimpleA2AClient("http://localhost:3000");

// Get agent capabilities
const card = await client.getAgentCard();
console.log("Agent:", card.name);

// Send message
const response = await client.sendMessage("Generate a DID for me");
console.log("Response:", response);

// Stream messages
const stream = await client.sendMessageStream("Tell me about Hedera");
for await (const event of stream) {
  console.log("Event:", event);
}
```

## A2A Integration

This agent now supports the **A2A (Agent-to-Agent) protocol**, enabling standardized communication between agents. See [A2A_INTEGRATION.md](./A2A_INTEGRATION.md) for detailed documentation.

### A2A Endpoint Descriptions

#### `GET /.well-known/agent-card.json`

**Purpose**: Agent discovery and capability advertisement
**Response**: Agent metadata including skills, capabilities, and supported protocols
**Content-Type**: `application/json`

#### `POST /a2a/sendMessage`

**Purpose**: Send a message to the agent using A2A protocol
**Request Format**: JSON-RPC 2.0 with A2A message structure
**Response Format**: JSON-RPC 2.0 with agent response
**Content-Type**: `application/json`

**Request Structure**:

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "message": {
    "messageId": "unique-message-id",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "Your message here"
      }
    ],
    "contextId": "conversation-context-id"
  }
}
```

#### `POST /a2a/sendMessageStream`

**Purpose**: Send a message with real-time streaming response
**Request Format**: Same as `/a2a/sendMessage`
**Response Format**: Server-Sent Events (SSE) with task lifecycle events
**Content-Type**: `text/event-stream`

**Stream Events**:

- `task` - Task lifecycle (submitted → working → completed)
- `message` - Agent response messages
- `error` - Error notifications

### Key Benefits

- **Interoperability**: Communicate with other A2A-compliant agents
- **Standardization**: Follows official A2A protocol specification
- **Real-time Communication**: Streaming support for long-running tasks
- **Task Management**: Proper handling of complex operations
- **Backward Compatibility**: Existing REST API continues to work

### Quick Start with A2A

1. Start the A2A-enabled server: `npm run dev`
2. Test the integration: `npm run a2a:test`
3. Access agent card: `http://localhost:3000/.well-known/agent-card.json`
4. Send A2A messages: `POST /a2a/sendMessage`
5. Stream messages: `POST /a2a/sendMessageStream`

## Documentation

- [A2A Integration Guide](./A2A_INTEGRATION.md) - Detailed A2A protocol documentation
- [Hedera Agent Kit](https://docs.hedera.com/agents) - Hedera Agent Kit documentation
- [A2A Protocol](https://google-a2a.github.io/A2A) - Official A2A protocol specification
