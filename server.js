// Imports, creates an Express app and wra[s it with an HTTP server
const express = require('express');
const { createServer } = require('node:http');
const { join } = require ('node:path');
const { Server } = require('socket.io');
const app = express();
const httpServer = createServer (app);
const io = new Server(httpServer);

app.use(express.static(join(__dirname, 'dist')));
// Buffer defined, it holds messages so when you lose connection you can get recent texts
const MAX_BUFFER = 200;
const messageBuffer = [];

function addToBuffer(mesg) {
    messageBuffer.push(mesg);
    if (messageBuffer.length > MAX_BUFFER) {
        messageBuffer.shift();
    }
}
//Listens for a connection event on the socket.io server
io.on('connection', (socket) => {
    console.log('a user has connected');
    // When a new client connects, send them the message buffer
    socket.emit('chat:buffer', messageBuffer);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    // Listens for chat messages from socket client & sends to all connected clients
    socket.on('chat:message', (payload) => {
        addToBuffer (payload);
        io.emit('chat:message', payload)
});
});

// Starts the server on a defined port by the enviorment OR 3000
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
