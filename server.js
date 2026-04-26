const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const communityState = {
  photos: [],
  messages: [],
};

app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
  socket.emit('community:init', {
    photos: communityState.photos.slice(-20),
    messages: communityState.messages.slice(-50),
  });

  socket.on('chat:message', (payload) => {
    if (!payload || !payload.message) return;
    const item = {
      name: payload.name || 'Farmer',
      message: String(payload.message).slice(0, 500),
    };
    communityState.messages.push(item);
    communityState.messages = communityState.messages.slice(-100);
    io.emit('chat:message', item);
  });

  socket.on('photo:share', (payload) => {
    if (!payload || !payload.dataUrl) return;
    const item = {
      name: payload.name || 'Farmer',
      fileName: payload.fileName || 'farm-photo',
      dataUrl: payload.dataUrl,
    };
    communityState.photos.push(item);
    communityState.photos = communityState.photos.slice(-40);
    io.emit('photo:share', item);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Ferti Verse server running at http://localhost:${PORT}`);
});
