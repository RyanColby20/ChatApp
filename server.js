const express = require('express');
const { createServer } = require('node:http');
const { join } = require ('node:path');
const { Server } = require('socket.io');

const app = express();

const httpServer = createServer (app);
const io = new Server(httpServer);

app.use(express.static(join(__dirname, 'dist')));

io.on('connection', (socket) => {
    console.log('a user has connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chat:message', (payload) => {
    io.emit('chat:message', payload)
});
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
