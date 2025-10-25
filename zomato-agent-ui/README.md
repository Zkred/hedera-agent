# Zomato Agent UI

A modern React.js chat interface for communicating with the Zomato AI Agent using A2A (Agent-to-Agent) protocol.

## Features

- 🤖 **AI Agent Communication** - Chat with your Zomato AI agent using A2A protocol
- 💬 **Real-time Messaging** - Continuous chat with typing indicators
- 🍽️ **Restaurant Discovery** - Find and explore restaurants
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Built with Tailwind CSS and Zomato branding
- 🔄 **Streaming Support** - Real-time message streaming
- 🛡️ **Secure Communication** - Blockchain-based agent authentication

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **A2A Protocol** for agent communication
- **Hedera Agent Kit** integration
- **Real-time messaging** with Server-Sent Events

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Running Zomato Agent (A2A server)

### Installation

1. **Clone and install dependencies:**

   ```bash
   cd zomato-agent-ui
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp env.example .env
   ```

   Update `.env` with your agent configuration:

   ```env
   PORT=5173
   REACT_APP_AGENT_URL=http://localhost:3000
   REACT_APP_AGENT_DID=did:iden3:polygon:amoy:your-agent-did-here
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Usage

### Basic Chat

- Type messages in the input field
- Press Enter to send, Shift+Enter for new line
- Use quick action buttons for common tasks

### Quick Actions

- **🍽️ Find Restaurants** - Search for nearby restaurants
- **🔥 Popular Food** - Get trending food recommendations
- **📦 Track Order** - Check order status
- **❓ Help** - Get assistance

### Agent Capabilities

The agent can help with:

- Restaurant recommendations
- Food suggestions
- Order placement
- Order tracking
- Payment processing
- Location-based services

## Architecture

### Components

- **ChatContainer** - Main chat interface
- **ChatHeader** - Agent info and status
- **ChatMessage** - Individual message display
- **ChatInput** - Message input with auto-resize
- **TypingIndicator** - Loading animation
- **RestaurantCard** - Restaurant information display

### Services

- **AgentService** - A2A protocol communication
- **Message Types** - TypeScript interfaces for chat data

### A2A Integration

The UI communicates with the agent using:

- **Standard A2A endpoints** (`/a2a/sendMessage`)
- **Streaming support** (`/a2a/sendMessageStream`)
- **Agent discovery** (`/.well-known/agent-card.json`)
- **Secure authentication** with blockchain DIDs

## Customization

### Styling

The UI uses Zomato's brand colors:

- Primary: `#E23744` (Zomato Red)
- Secondary: `#FF6B6B` (Light Red)
- Accent: `#FFD93D` (Yellow)

### Adding Features

1. **New Message Types** - Extend the `Message` interface
2. **Custom Components** - Add new UI components
3. **Agent Capabilities** - Update the agent service

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Project Structure

```
src/
├── components/          # React components
│   ├── ChatContainer.tsx
│   ├── ChatHeader.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── TypingIndicator.tsx
│   └── RestaurantCard.tsx
├── services/            # API services
│   └── agentService.ts
├── types/              # TypeScript types
│   └── chat.ts
├── App.tsx             # Main app component
├── App.css            # Global styles
└── index.css          # Tailwind imports
```

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Set these in your production environment:

- `REACT_APP_AGENT_URL` - Your agent server URL
- `REACT_APP_AGENT_DID` - Agent's blockchain identity

### Hosting

The built app can be deployed to:

- Vercel
- Netlify
- AWS S3
- Any static hosting service

## Troubleshooting

### Common Issues

1. **Agent Connection Failed**

   - Check `REACT_APP_AGENT_URL` is correct
   - Ensure agent server is running
   - Verify network connectivity

2. **Authentication Errors**

   - Verify `REACT_APP_AGENT_DID` is valid
   - Check agent is registered on blockchain
   - Ensure proper handshake completion

3. **Styling Issues**
   - Run `npm install` to ensure Tailwind is installed
   - Check `tailwind.config.js` configuration
   - Verify CSS imports in `index.css`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Check the troubleshooting section
- Review the A2A protocol documentation
- Contact the development team
