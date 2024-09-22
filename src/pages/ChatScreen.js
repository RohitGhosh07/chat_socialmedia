import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion'; // For animations
import { Howl } from 'howler'; // For sound effects

// Sound effects
const sendSound = new Howl({
    src: ['https://www.soundjay.com/button/beep-07.wav'], // Placeholder URL for sent sound
    volume: 1.0,
});
const receiveSound = new Howl({
    src: ['https://www.soundjay.com/button/beep-09.wav'], // Placeholder URL for received sound
    volume: 1.0,
});

function ChatScreen({ currentUserId, otherUserId, otherUserName }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatId, setChatId] = useState(null);
    const chatEndRef = useRef(null); // For auto-scrolling

    // Scroll to the bottom (new message) when messages change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Fetch chat and messages when the component mounts
    useEffect(() => {
        const fetchChat = async () => {
            try {
                const { data: chat } = await axios.post('http://localhost:5000/api/chats/chats', {
                    userId: currentUserId,
                    otherUserId,
                });
                setChatId(chat.id);
                fetchMessages(chat.id);
            } catch (err) {
                console.error('Error fetching chat:', err);
            }
        };

        const fetchMessages = async (chatId) => {
            try {
                const { data: messages } = await axios.get(`http://localhost:5000/api/chats/chats/${chatId}/messages`);
                setMessages(messages);
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };

        fetchChat();
    }, [currentUserId, otherUserId]);

    // Handle sending new message
    const sendMessage = async () => {
        if (newMessage.trim() === '') return;

        try {
            const { data: message } = await axios.post(`http://localhost:5000/api/chats/chats/${chatId}/messages`, {
                senderId: currentUserId,
                text: newMessage,
            });

            // Add the new message to the chat and clear the input
            setMessages([...messages, message]);
            setNewMessage('');

            // Play send sound
            sendSound.play();
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    // Play sound when a new message is received
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.senderId !== currentUserId) {
                receiveSound.play();
            }
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Message List */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`flex flex-col ${msg.senderId === currentUserId ? 'items-end' : 'items-start'}`}
                        >
                            {/* Display the sender's name */}
                            <p className="text-xs text-gray-500 mb-1">
                                {msg.senderId === currentUserId ? 'You' : otherUserName}
                            </p>

                            {/* Message bubble */}
                            <motion.div
                                className={`p-3 rounded-2xl max-w-xs ${msg.senderId === currentUserId
                                    ? 'bg-blue-500 text-white shadow-lg rounded-br-none'
                                    : 'bg-gray-200 text-gray-800 shadow rounded-bl-none'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                            >
                                <p>{msg.text}</p>
                            </motion.div>

                            {/* Timestamp */}
                            <span className="text-xs text-gray-400 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </motion.div>
                    ))
                ) : (
                    // Placeholder content when no messages are available
                    <div className="flex flex-col items-center justify-center h-full">
                        <img
                            src="https://pic.funnygifsbox.com/uploads/2019/03/funnygifsbox.com-2019-03-09-12-14-45-94.gif" // Replace with actual image link
                            alt="No messages"
                            className="mb-4"
                        />
                        <p className="text-gray-500">Start a conversation with {otherUserName}</p>
                    </div>
                )}
                {/* Scroll reference for auto-scrolling */}
                <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white flex items-center space-x-4 border-t border-gray-300 shadow-lg">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-out"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-out"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default ChatScreen;
