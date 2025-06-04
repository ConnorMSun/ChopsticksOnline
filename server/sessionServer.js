const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { sessionRoutes } = require('./services/sessionService');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' })); 
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' } 
});

sessionRoutes(app, io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Session service listening on port ${PORT}`);
});
