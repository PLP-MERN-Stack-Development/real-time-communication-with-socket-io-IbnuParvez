import { useEffect, useRef } from 'react';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="message-list flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg) => (
        <div key={msg.id || msg.timestamp} className={`message ${msg.system ? 'text-center text-gray-500' : 'flex items-start space-x-2'}`}>
          {msg.system ? (
            <div className="system-message bg-gray-200 rounded px-2 py-1 text-sm">
              {msg.message} - {formatTimestamp(msg.timestamp)}
            </div>
          ) : (
            <>
              <div className="avatar w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {msg.username ? msg.username.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="message-content flex-1">
                <div className="message-header flex items-center space-x-2">
                  <span className="username font-semibold text-gray-800">{msg.username}</span>
                  <span className="timestamp text-xs text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                </div>
                <div className="message-text bg-white rounded-lg px-3 py-2 shadow-sm">
                  {msg.message}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;