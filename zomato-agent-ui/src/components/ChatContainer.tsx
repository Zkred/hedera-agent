import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatState } from '../types/chat';
import { AgentService } from '../services/agentService';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
// import RestaurantCard from './RestaurantCard';

const ChatContainer: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    currentOrder: undefined,
    userLocation: undefined
  });

  const [agentService] = useState(() => new AgentService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hi! I'm your Zomato AI agent. I can help you find restaurants, suggest food, and even place orders. What would you like to do today?",
      sender: 'agent',
      timestamp: new Date()
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [welcomeMessage]
    }));
  }, []);

  const addMessage = (text: string, sender: 'user' | 'agent', type: 'text' | 'restaurant' | 'order' | 'payment' = 'text', data?: any) => {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender,
      timestamp: new Date(),
      type,
      data
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  const handleSendMessage = async (messageText: string) => {
    // Add user message
    addMessage(messageText, 'user');

    // Set typing indicator
    setChatState(prev => ({ ...prev, isTyping: true }));

    try {
      // Send message to agent
      const response = await agentService.sendMessage(messageText);
      
      // Add agent response
      addMessage(response, 'agent');
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage(
        "Sorry, I'm having trouble connecting to the agent right now. Please try again later.",
        'agent'
      );
      setIsConnected(false);
    } finally {
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  };

  // const handleRestaurantSelect = (restaurant: any) => {
  //   addMessage(`I'd like to order from ${restaurant.name}`, 'user');
  //   // Here you would typically open a menu or order flow
  // };

  const handleQuickActions = (action: string) => {
    const quickMessages = {
      'find_restaurants': 'Find restaurants near me',
      'popular_food': 'What are the most popular dishes today?',
      'order_tracking': 'Track my order',
      'help': 'Help me with food recommendations'
    };

    handleSendMessage(quickMessages[action as keyof typeof quickMessages] || action);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <ChatHeader 
        agentName="Zomato AI Agent"
        status={chatState.isTyping ? 'typing' : isConnected ? 'online' : 'offline'}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {chatState.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {chatState.isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickActions('find_restaurants')}
              className="px-3 py-1.5 bg-zomato-primary text-white text-sm rounded-full hover:bg-red-600 transition-colors"
            >
              🍽️ Find Restaurants
            </button>
            <button
              onClick={() => handleQuickActions('popular_food')}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
            >
              🔥 Popular Food
            </button>
            <button
              onClick={() => handleQuickActions('order_tracking')}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
            >
              📦 Track Order
            </button>
            <button
              onClick={() => handleQuickActions('help')}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
            >
              ❓ Help
            </button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={chatState.isTyping}
        placeholder="Ask me about restaurants, food, or place an order..."
      />
    </div>
  );
};

export default ChatContainer;
