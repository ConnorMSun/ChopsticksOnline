const sessions = {};

function generateSessionId() {
  let id;
  do {
    id = Math.floor(Math.random() * 89999 + 10000).toString();
  } while (sessions[id]);
  return id;
}

function sessionRoutes (app, io) {
  app.post('/create-session', (req, res) => {
    const id = generateSessionId();
    sessions[id] = {
      sessionId: id,
      players: [],
      maxPlayers: 2
    };
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

  app.post('/leave-session', (req, res) => {
    const { sessionId, playerId } = req.body;
    const session = sessions[sessionId];

    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.players = session.players.filter(id => id !== playerId);

    if (session.players.length === 0) {
      delete sessions[sessionId];
    }

    res.status(200).json({ message: `Left session ${sessionId}` });
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
    sessionRoutes,
    sessions
};