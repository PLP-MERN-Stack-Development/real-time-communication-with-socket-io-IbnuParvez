import React from 'react';
import { useEffect } from 'react';
import { useSocket } from '../socket/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import TypingIndicator from './TypingIndicator';

const ChatRoom = ({ user, onLogout }) => {
  const { messages, users, typingUsers, connect, sendMessage, setTyping, isConnected } = useSocket();

  useEffect(() => {
    if (user && user.username) {
      connect(user.username);
    }
  }, [user, connect]);

  const handleSendMessage = (message) => {
    if (isConnected) {
      sendMessage(message);
    } else {
      alert('Not connected to chat server');
    }
  };

  const handleTyping = (isTyping) => {
    if (isConnected) {
      setTyping(isTyping);
    }
  };

  if (!isConnected) {
    return <div className="flex items-center justify-center h-screen">Connecting to chat...</div>;
  }

  return (
    <div className="chat-room flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-300 px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Chat Room</h1>
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} />
        </div>
        <TypingIndicator typingUsers={typingUsers} />
        <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
      </div>
      <div className="w-64 bg-white border-l border-gray-300 hidden md:block">
        <UserList users={users} />
      </div>
    </div>
  );
};

export default ChatRoom;