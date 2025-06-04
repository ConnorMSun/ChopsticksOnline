const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { trimmerRoutes } = require('./services/trimmerService.js'); // Adjust path as needed

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

// Register trimmer service routes
trimmerRoutes(app, io);

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Trimmer service listening on port ${PORT}`);
});
