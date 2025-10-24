# Hedera Agent API

A TypeScript-based API service that provides AI-powered interactions with the Hedera network using LangChain and the Hedera Agent Kit. Now with **A2A (Agent-to-Agent) protocol support** for standardized agent communication.

## 🚀 Features

- **Hedera Network Integration**: Full support for Hedera operations via Hedera Agent Kit
- **AI-Powered**: Uses OpenAI GPT models for intelligent responses
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
- **POST** `/a2a/sendMessage` - Send message (A2A format)
- **POST** `/a2a/sendMessageStream` - Stream messages (Server-Sent Events)

### A2A Agent Card

The agent card defines capabilities and is available at `/.well-known/agent-card.json`:

```json
{
  "name": "Hedera Network Agent",
  "description": "A specialized agent for Hedera network operations",
  "skills": [
    {
      "id": "hedera-operations",
      "name": "Hedera Operations",
      "description": "Perform operations on the Hedera network"
    },
    {
      "id": "did-generation",
      "name": "DID Generation",
      "description": "Generate decentralized identifiers"
    }
  ],
  "capabilities": {
    "streaming": true,
    "pushNotifications": true
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

```bash
# Get agent card
curl http://localhost:3000/.well-known/agent-card.json

# Send A2A message
curl -X POST http://localhost:3000/a2a/sendMessage \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "message": {
      "messageId": "test-123",
      "role": "user",
      "parts": [{"kind": "text", "text": "Hello, agent!"}],
      "kind": "message"
    }
  }'

# Stream A2A messages
curl -X POST http://localhost:3000/a2a/sendMessageStream \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "messageId": "stream-123",
      "role": "user",
      "parts": [{"kind": "text", "text": "Tell me about Hedera"}],
      "kind": "message"
    }
  }'
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
