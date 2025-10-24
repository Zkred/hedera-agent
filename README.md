# Hedera Agent API

A TypeScript-based API service that provides AI-powered interactions with the Hedera network using LangChain and the Hedera Agent Kit.

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
npm run dev
```

### Build the project:

```bash
npm run build
```

### Run the production build:

```bash
npm start
```

## API Endpoints

### Health Check

- **GET** `/health`
- Returns the API status

### Send Message

- **POST** `/message`
- **Body**: `{ "message": "your message here" }`
- **Response**: `{ "response": "AI response", "success": true }`

## Example Usage

### Using curl:

```bash
# Health check
curl http://localhost:3000/health

# Send a message
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message": "what'\''s my balance?"}'
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
