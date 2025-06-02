const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const { sessionRoutes, sessions } = require('./services/sessionService');
const { gameRoutes } = require('./services/gameService');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(bodyParser.json()); 

sessionRoutes(app, io);
gameRoutes(app, io);

app.use(express.static('./public'));

app.get('/open-lobbies', (req, res) => {
    const openLobbies = Object.entries(sessions)
        .filter(([_, session]) => session.players.length < 2) 
        .map(([id, _]) => ({ sessionId: id }));
    
    res.json(openLobbies);
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});