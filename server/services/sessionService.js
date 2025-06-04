const { io: ClientIO } = require("socket.io-client");

const sessions = {};

function generateSessionId() {
  let id;
  do {
    id = Math.floor(Math.random() * 89999 + 10000).toString();
  } while (sessions[id]);
  return id;
}

function sessionRoutes (app, io) {
  const gameServiceSocket = ClientIO("http://localhost:3002");

  gameServiceSocket.on("connect", () => {
    console.log("Connected to Game Service (3002)");
  });

  gameServiceSocket.on("game-update", (data) => {
    const { newState, sessionId, move } = data;
    console.log(`Received game-update from Game Service for session ${sessionId}`);

    io.to(sessionId).emit("game-update", {newState, move}); 
  });

  app.post('/create-session', async (req, res) => {
    const id = generateSessionId();
    sessions[id] = {
      sessionId: id,
      players: [],
      maxPlayers: 2
    };
    console.log(`Session created: ${id}`);//debug
    try {
      await fetch('http://localhost:3003/track-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id })
      });
    } catch (error) {
      console.error(`Failed to track session ${id}:`, error.message);
      console.error('Error tracking session:', error);
    }
    res.status(201).json({ sessionId: id });
  });

  app.post('/join-session', (req, res) => {
    const { sessionId, playerId } = req.body;
    const session = sessions[sessionId];

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.players.length >= session.maxPlayers) return res.status(400).json({ message: 'Session is full' });

    session.players.push(playerId);
    res.status(200).json({ message: `Joined session ${sessionId}`, player: session.players.length });
  });

  app.post('/leave-session', async (req, res) => {
    const { sessionId, playerId } = req.body;
    const session = sessions[sessionId];

    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.players = session.players.filter(id => id !== playerId);

    if (session.players.length === 0) {
      delete sessions[sessionId];

      try {
        await fetch('http://localhost:3003/trim-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId })
        });
      } catch (err) {
        console.error(`Failed to untrack session ${sessionId}:`, err.message);
      }
    }
    console.log(`Player ${playerId} left session ${sessionId}`);
    res.status(200).json({ message: `Left session ${sessionId}` });
  });

  app.post('/reflect-cull', (req, res) => {
    console.log("Reflecting cull");
    const { trimmed } = req.body;
    if (!trimmed || !Array.isArray(trimmed)) {
      return res.status(400).json({ message: 'Invalid trimmed session data' });
    }
    let reflected = [];

    for(sessionId of trimmed) {
      if (sessions[sessionId]) {
        reflected.push(sessionId);
        delete sessions[sessionId];
      }
    }
    res.status(200).json({ message: 'Sessions reflected', reflected });
  });

  app.get('/open-lobbies', (req, res) => {
    const openLobbies = Object.entries(sessions)
    .filter(([_, session]) => session.players.length < session.maxPlayers)
    .map(([sessionId]) => ({ sessionId }));

    res.status(200).json(openLobbies);
  });


  if (io) {
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('join-session', (sessionId) => {
        if (sessions[sessionId]) {
          socket.join(sessionId);
          pnum = sessions[sessionId].players.length || 0; 
          socket.emit('joined-session', { sessionId, pnum });
          console.log(`Socket ${socket.id} joined session ${sessionId}`);
        } else {
          socket.emit('error', 'Session not found');
        }
      });

      socket.on('leave-session', (sessionId) => {
        socket.leave(sessionId);
        console.log(`Socket ${socket.id} left session ${sessionId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }
};

module.exports = {
    sessionRoutes
};