import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex max-w-xs lg:max-w-md">
        {/* Avatar */}
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
            🤖
          </div>
        </div>

        {/* Typing Animation */}
        <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-sm px-4 py-2">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">Agent is typing</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
