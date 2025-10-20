import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { io } from 'socket.io-client';


const URL = import.meta.env.PROD ? undefined : "http://localhost:3000";
export const socket = io(URL, { autoConnect: false });

const fmtTime = (ts) =>
    ts ? new Date(ts).toLocaleString([], {
        hour: '2-digit', minute: '2-digit'
    }) : '...';

const App = () => {


    // State
    const [isConnected, setIsConnected] = useState(false);
    const [localUserId, setLocalUserId] = useState(null);
    const [username, setUsername] = useState(null); 
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    
    // Opens on inital render.
    useEffect(() => {
        // Retrieve saved data(if page was reloaded)
        const savedUsername = sessionStorage.getItem('minimalChatUsername');
        const savedLocalId = sessionStorage.getItem('minimalChatLocalUserId');
        
        if (savedUsername) {
            setUsername(savedUsername);
            setLocalUserId(savedLocalId);
        }
        // Event Handlers
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onChatMessage(msg) {
            setMessages(prev => [...prev, msg]);
        }
        
        // Register Event listeners, Messages are added to buffer 
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('chat:message', onChatMessage);
        socket.on('chat:buffer', (buffer) => {
            setMessages(buffer);
        });

        socket.connect();
    
        return () => {
            // Cleanup event listeners on unmount
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('chat:message', onChatMessage);
        }
         
    }, []);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- 3. Message Send Handler  ---
    const sendMessage = (e) => {
        e.preventDefault();
        if (!username || !localUserId || newMessage.trim() === '' || !isConnected) return;


        const messagePayload = {
            id: crypto.randomUUID ? crypto.randomUUID() : '${Date.now()}-${Math.random()}',
            timestamp: Date.now(),
            userId: localUserId,     
            username,     
            text: newMessage.trim(),
        };
        socket.emit('chat:message', messagePayload);
        setNewMessage('');
        };

    // Set username and set a local user ID, Both sent to session storage
    const handleSetUsername = (e) => {
        e.preventDefault();
        const inputName = e.target.elements.nameInput.value.trim();
        if (inputName) {
            sessionStorage.setItem('minimalChatUsername', inputName);
            sessionStorage.setItem('minimalChatLocalUserId', Math.random().toString(36).substring(2, 8));
            setUsername(inputName);
            setLocalUserId(sessionStorage.getItem('minimalChatLocalUserId'));
        }
    };
    // Prompt for username if not set
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
            <header className="app-header">
                <h1>Client Running</h1>

            <div className="connection-controls">
                <button type="button" onClick={() => socket.connect()} disabled={isConnected}>Connect</button>
                <button type="button" onClick={() => socket.disconnect()} disabled={!isConnected}>Disconnect</button>
                <span style={{ marginLeft: 8 }}>{isConnected ? '🟢' : '🔴'}</span>
                <span className="divider" aria-hidden="true" />
                <div className="user-badge">User: <span>{username}</span></div>
            </div>
            </header>


            {/* Messages + Input wrapped in a centered box */}
        <section className="chat-box">
            <main>
                {messages.length === 0 ? (
                    <div>Start the conversation.</div>
                ) : (
                messages.map((msg) => {
                    const isMine = msg.userId === localUserId;
                    const who = isMine ? 'You' : msg.username;
                    return (
                    <div key={msg.id} className="message-line">
                        {`${who} · ${fmtTime(msg.timestamp)} : ${msg.text}`}
                    </div>
                    );
                })
                )}
                <div ref={messagesEndRef} />
            </main>

        <form className="chat-form" onSubmit={sendMessage}>
            <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!isConnected}
            />
            <button type="submit" disabled={newMessage.trim() === '' || !isConnected}>
                Send
            </button>
        </form>
        </section>
        </div>
    );
};

export default App;
