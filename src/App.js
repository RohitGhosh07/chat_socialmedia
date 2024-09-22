import React from 'react';
import ChatScreen from './pages/ChatScreen';

function App() {
  const currentUserId = 13; // Replace with logged-in user ID
  const otherUserId = 14; // Replace with ID of the person you're chatting with

  return (
    <div>
      <ChatScreen currentUserId={currentUserId} otherUserId={otherUserId} />
    </div>
  );
}

export default App;
