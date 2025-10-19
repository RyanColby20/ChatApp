import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
    // State
    const [localUserId, setLocalUserId] = useState(null);
    const [username, setUsername] = useState(null); 
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Static variables for simulation
    const isConnected = true; 
    const mockServerKey = 'chatServerMessages';
    
    // --- 1. Initialization and Data Loading ---
    useEffect(() => {
        const savedUsername = localStorage.getItem('minimalChatUsername');
        const savedLocalId = localStorage.getItem('minimalChatLocalUserId');
        
        if (savedUsername) {
            setUsername(savedUsername);
            setLocalUserId(savedLocalId);
        }

        const savedMessages = localStorage.getItem(mockServerKey);
        if (savedMessages) {
            try {
                const initialMsgs = JSON.parse(savedMessages).sort((a, b) => a.timestamp - b.timestamp);
                setMessages(initialMsgs);
            } catch (e) {
                console.error("Error loading mock server messages:", e);
            }
        }
    }, []);

    // --- 2. Scroll to Bottom Effect ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- 3. Message Send Handler (Simulates Socket.io 'emit') ---
    const sendMessage = (e) => {
        e.preventDefault();
        
        if (!username || !localUserId || newMessage.trim() === '' || !isConnected) return;

        const messageText = newMessage.trim();
        setNewMessage(''); 

        const messagePayload = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
            timestamp: Date.now(),
            userId: localUserId,     
            username: username,      
            text: messageText,
        };

        const savedMsgs = localStorage.getItem(mockServerKey);
        let messagesOnServer = savedMsgs ? JSON.parse(savedMsgs) : [];
        messagesOnServer.push(messagePayload);
        localStorage.setItem(mockServerKey, JSON.stringify(messagesOnServer));

        setMessages(prevMessages => [...prevMessages, messagePayload]); 
    };

    // --- 4. Handle Username Entry Render ---
    const handleSetUsername = (e) => {
        e.preventDefault();
        const inputName = e.target.elements.nameInput.value.trim();
        if (inputName) {
            localStorage.setItem('minimalChatUsername', inputName);
            localStorage.setItem('minimalChatLocalUserId', Math.random().toString(36).substring(2, 8));
            setUsername(inputName);
            setLocalUserId(localStorage.getItem('minimalChatLocalUserId'));
        }
    };

    if (!username) {
        return (
            <>
                <h2>
                    Welcome to Local Chat
                </h2>
                <form onSubmit={handleSetUsername}>
                    <input
                        name="nameInput"
                        type="text"
                        placeholder="Enter Your Display Name"
                        maxLength={15}
                        required
                    />
                    <button
                        type="submit"
                    >
                        Start Chatting
                    </button>
                </form>
            </>
        );
    }

    // --- 5. Main Chat UI Render ---
    return (
        <div className='center-container'>
            {/* Header */}
            <header>
                <h1>Client Running</h1>
                <span>
                    User: <span>{username}</span>
                </span>
            </header>

            {/* Messages Area */}
            <main>
                {messages.length === 0 ? (
                    <div>
                        Start the conversation.
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.userId === localUserId;

                        return (
                            <div 
                                key={msg.id} 
                            >
                                <div style={{border: "1px solid blue"}}>
                                    {/* Sender Info */}
                                    <span>
                                        Sender: {isMine ? 'You' : msg.username}
                                    </span>
                                    
                                    {/* Message Bubble */}
                                    <div>
                                        Message: {msg.text}
                                    </div>
                                    
                                    {/* Timestamp */}
                                    <div>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Form */}
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!isConnected}
                />
                <button
                    type="submit"
                    disabled={newMessage.trim() === '' || !isConnected}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default App;
