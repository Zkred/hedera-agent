# 🍕 Zomato Food Delivery Agent

A specialized A2A (Agent-to-Agent) compatible food delivery agent built with LangChain and Hedera blockchain integration. This agent can discover restaurants, browse menus, place orders, and track deliveries while maintaining secure transactions through the Hedera network.

## 🚀 Features

### Core Food Delivery Capabilities

- **Restaurant Discovery**: Find restaurants by location, cuisine, rating, and delivery preferences
- **Menu Browsing**: Browse restaurant menus with detailed item information, pricing, and availability
- **Order Placement**: Place food orders with automatic price calculation and validation
- **Order Tracking**: Track order status and delivery progress with real-time updates
- **Secure Payments**: Handle payments through Hedera blockchain for secure transactions

### A2A Protocol Support

- **Agent Card**: Compliant with A2A protocol for agent discovery
- **Message Handling**: Support for both REST API and A2A protocol endpoints
- **Streaming**: Real-time updates via Server-Sent Events (SSE)
- **Task Management**: Full task lifecycle management (submitted → working → completed)

### Blockchain Integration

- **Hedera Network**: Secure blockchain operations for payments and identity verification
- **DID Management**: Decentralized identity management using Zkred Agent ID plugin
- **Smart Contracts**: Integration with Hedera smart contracts for secure transactions

## 🛠️ Tech Stack

- **Language**: TypeScript/JavaScript
- **Framework**: Express.js
- **AI/LLM**: LangChain with OpenAI GPT-4
- **Blockchain**: Hedera Hashgraph SDK
- **Protocol**: A2A (Agent-to-Agent) Protocol v0.3.0
- **Tools**: Custom food delivery tools for restaurant discovery, menu browsing, and order management

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hedera-agent/zomato
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with the following variables:

   ```env
   HEDERA_ACCOUNT_ID=your_hedera_account_id
   HEDERA_PRIVATE_KEY=your_hedera_private_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   AGENT_URL=http://localhost:3000
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Usage

### Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on port 3000 (or the PORT specified in your .env file).

### Available Endpoints

#### Health Check

```bash
GET http://localhost:3000/health
```

#### A2A Agent Card

```bash
GET http://localhost:3000/.well-known/agent-card.json
```

#### Message Endpoints

```bash
# REST API
POST http://localhost:3000/message
Content-Type: application/json
{
  "message": "I want to order pizza from Pizza Palace"
}

# A2A Protocol
POST http://localhost:3000/a2a/sendMessage
Content-Type: application/json
{
  "message": {
    "parts": [
      {
        "kind": "text",
        "text": "I want to order pizza from Pizza Palace"
      }
    ]
  }
}

# A2A Streaming
POST http://localhost:3000/a2a/sendMessageStream
```

## 🧪 Testing

### Test the Zomato Agent

```bash
npm run test:zomato
```

This will run a comprehensive test of the agent's capabilities including:

- Restaurant discovery
- Menu browsing
- Order placement
- Order tracking
- General food queries

### Test A2A Protocol

```bash
npm run a2a:test
```

## 🍽️ Example Usage

### Restaurant Discovery

```
User: "I'm in New York and looking for Italian restaurants near me"
Agent: [Searches for Italian restaurants in New York with ratings, delivery times, and fees]
```

### Menu Browsing

```
User: "Can you show me the menu for Pizza Palace?"
Agent: [Displays complete menu with items, prices, categories, and availability]
```

### Order Placement

```
User: "I want to order a Margherita Pizza and Coca Cola from Pizza Palace"
Agent: [Validates order, calculates total with tax and delivery fee, places order]
```

### Order Tracking

```
User: "What's the status of my order?"
Agent: [Shows current order status, delivery progress, and estimated delivery time]
```

## 🔧 Agent Capabilities

The Zomato agent includes the following tools:

### Restaurant Tools

- `search_restaurants`: Find restaurants by location and filters
- `get_restaurant_details`: Get detailed restaurant information

### Menu Tools

- `get_restaurant_menu`: Browse complete restaurant menus
- `get_menu_item_details`: Get detailed information about specific menu items

### Order Tools

- `place_order`: Place food orders with validation and pricing
- `get_order_status`: Track order status and delivery progress
- `update_order_status`: Update order status (for restaurant/delivery use)

### Blockchain Tools

- Hedera network operations
- DID generation and management
- Secure payment processing
- Identity verification

## 🌐 A2A Protocol Compliance

This agent is fully compliant with the A2A (Agent-to-Agent) Protocol v0.3.0:

- **Agent Card**: Provides comprehensive agent information and capabilities
- **Message Handling**: Supports both synchronous and streaming message processing
- **Task Management**: Full task lifecycle with status updates
- **Error Handling**: Proper error codes and messages
- **Authentication**: Secure agent-to-agent communication

## 🔒 Security Features

- **Hedera Blockchain**: All transactions are secured through Hedera network
- **DID Management**: Decentralized identity for secure agent communication
- **Input Validation**: Comprehensive validation of all inputs
- **Error Handling**: Secure error handling without information leakage
- **Authentication**: API key and token-based authentication

## 📊 Mock Data

The agent includes comprehensive mock data for demonstration:

- **4 Restaurants**: Pizza Palace, Burger Barn, Sushi Express, Taco Fiesta
- **15+ Menu Items**: Complete menus with pricing, descriptions, and availability
- **Order Management**: Full order lifecycle with status tracking
- **Location Data**: New York-based restaurant locations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Check the health endpoint: `GET /health`
- Review the agent card: `GET /.well-known/agent-card.json`
- Run the test suite: `npm run test:zomato`

## 🔮 Future Enhancements

- Real restaurant API integration
- Payment gateway integration
- Real-time delivery tracking
- Multi-language support
- Advanced recommendation engine
- Integration with delivery services
- Mobile app support
