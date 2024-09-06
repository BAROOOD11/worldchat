const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let messages = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current messages to the new user
    socket.emit('chat history', messages);

    // When a message is received
    socket.on('send message', (data) => {
        const message = { username: data.username, message: data.message, time: Date.now() };
        messages.push(message);
        io.emit('receive message', message);

        // Automatically delete message after 10 minutes
        setTimeout(() => {
            messages = messages.filter(m => m.time !== message.time);
            io.emit('delete message', message.time);
        }, 10 * 60 * 1000); // 10 minutes
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
