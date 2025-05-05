const sessions = []; 
let sessionIdCounter = 0;

function generateSessionId() {
    let newSessionId;
    let exists = true;
    while(exists) {
        newSessionId = Math.floor(Math.random() * 89999) + 10000;
        newSessionId = newSessionId.toString();
        exists = false;
        for(let i = 0; i < sessionIdCounter; i++) {
            if(sessions[i].sessionId === newSessionId) {
                exists = true;
                break;
            }
        }
    }
    sessionIdCounter++;
    return sessionIdCounter.toString();
}

module.exports = (app) => {
    app.post('/create-session', (req, res) => {
        const newSessionId = generateSessionId();
        sessions[newSessionId] = {
        players: [],
        maxPlayers: 2, 
    };

    console.log(`Created session with ID: ${newSessionId}`);
    res.status(201).json({ sessionId: newSessionId });
  });

    app.post('/join-session', (req, res) => {
        const { sessionId, playerId } = req.body;

        let session = null;
        for (let i = 0; i < sessions.length; i++) {
          if (sessions[i].sessionId === sessionId) {
            session = sessions[i];
            break;
          }
        }

        if (!sessions[sessionId]) {
        return res.status(404).json({ message: 'Session not found' });
        }

        if (session.players.length >= session.maxPlayers) {
        return res.status(400).json({ message: 'Session is full' });
        }

        session.players.push(playerId);
        console.log(`Player ${playerId} joined session ${sessionId}`);
        res.status(200).json({ message: `Joined session ${sessionId}` });
    });
};
