import React, { useState, useEffect } from 'react';
import { AgentService } from '../services/agentService';

interface ChatHeaderProps {
  agentName?: string;
  status?: 'online' | 'offline' | 'typing';
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  agentName = "Zomato Agent", 
  status = 'online' 
}) => {
  const [agentInfo, setAgentInfo] = useState<any>(null);

  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const agentService = new AgentService();
        const card = await agentService.getAgentCard();
        setAgentInfo(card);
      } catch (error) {
        console.error('Failed to fetch agent info:', error);
      }
    };

    fetchAgentInfo();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'typing': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Online';
      case 'typing': return 'Typing...';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Agent Avatar */}
          <div className="relative">
            <div className="w-10 h-10 bg-zomato-primary text-white rounded-full flex items-center justify-center font-semibold">
              🤖
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor()}`}></div>
          </div>

          {/* Agent Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{agentName}</h2>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${status === 'online' ? 'text-green-600' : status === 'typing' ? 'text-yellow-600' : 'text-gray-500'}`}>
                {getStatusText()}
              </span>
              {agentInfo && (
                <span className="text-xs text-gray-500">
                  • {agentInfo.skills?.length || 0} capabilities
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a10 10 0 1 1 20 0v5z" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Agent Capabilities */}
      {agentInfo && agentInfo.skills && (
        <div className="mt-3 flex flex-wrap gap-2">
          {agentInfo.skills.slice(0, 3).map((skill: any, index: number) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zomato-primary bg-opacity-10 text-zomato-primary"
            >
              {skill.name}
            </span>
          ))}
          {agentInfo.skills.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{agentInfo.skills.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
