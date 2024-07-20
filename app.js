const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 600000,
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

require('./modals/modal');
require('./modals/post');
require('./modals/Message');
require('./modals/conversation');
require('./modals/group');
require('./modals/groupmsg');

app.use(require('./routes/auth'));
app.use(require('./routes/createPost'));
app.use(require('./routes/user'));

const { mongoURL } = require('./keys');
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });

// Track online users
let onlineUsers = {};

io.on('connection', (socket) => {
    console.log('connected to socket.io');

    socket.on('user_connected', (userId) => {
        onlineUsers[userId] = socket.id;
        io.emit('update_user_status', { userId, status: 'online' });
        console.log(`User connected: ${userId}`);
    });

    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined conversation: ${conversationId}`);
    });

    socket.on('send_message', (newMessage) => {
        io.to(newMessage.conversationId).emit('receive_message', newMessage);
    });

    socket.on('typing', ({ conversationId, userName }) => {
        socket.to(conversationId).emit('typing', { conversationId, userName });
    });

    socket.on('disconnect', () => {
        let userId = null;
        for (let id in onlineUsers) {
            if (onlineUsers[id] === socket.id) {
                userId = id;
                break;
            }
        }
        if (userId) {
            delete onlineUsers[userId];
            io.emit('update_user_status', { userId, status: 'offline' });
            console.log(`User disconnected: ${userId}`);
        }
    });
});

const frontendBuildPath = path.join(__dirname, 'frontend', 'build');
console.log('Frontend build path:', frontendBuildPath);

fs.readdir(frontendBuildPath, (err, files) => {
    if (err) {
        console.error('Error in reading directory:', err);
    } else {
        console.log('Files in frontend build directory:', files);
    }
});

app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(err.status || 500).send('Error: Unable to serve index.html');
        }
    });
});

server.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
