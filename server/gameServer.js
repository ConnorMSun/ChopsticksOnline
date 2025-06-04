
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { gameRoutes } = require('./services/gameService.js');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' })); 
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' }
});

gameRoutes(app, io);

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Game service listening on port ${PORT}`);
});
