const fs = require('fs');

let sessions = {};
let vanguard = {};
console.log("Trimmer service initialized");
function cullSessions() {
    console.log("Cull started");
    let curtime = Date.now();
    let trimmed = []
    for(sessionId in sessions) {
        let session = sessions[sessionId];
        if(curtime - session.startTime > 7000) {
            trimmed.push(sessionId);
            delete sessions[sessionId];
            console.log(`Session ${session} has been trimmed due to inactivity.`);
        }
    }

    if (trimmed.length > 0) {
        console.log("afk lobbies found")//debug
        fetch('http://localhost:3000/reflect-cull', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trimmed })
        })
        .then(res => res.json())
        .then(data => console.log('Trim reflected:', data))
        .catch(err => console.error('Error:', err));
    }
    console.log("Cull completed");
    setTimeout(cullSessions, 7000);
}
cullSessions();

function trimmerRoutes(app, io) {
    app.post('/track-session', (req, res) => {
        const { sessionId } = req.body;
        if(!sessionId) {
            console.error("Invalid session data received");
            return res.status(400).json({ message: 'Invalid session data' }); 
        }
        const start = Date.now();
        sessions[sessionId] = {
            sessionId: sessionId,
            startTime: start
        };
        console.log(`Session ${sessionId} is being tracked`);
        res.status(200).json({ message: `Session ${sessionId} is being tracked` });
    });

    app.post('/trim-session', (req, res) => {
        const { sessionId } = req.body;
        if(!sessionId) {
            console.error("Invalid session data received for trimming");
            return res.status(400).json({ message: 'Invalid session data' });
        }
        delete sessions[sessionId];
        console.log(`Session ${sessionId} has been trimmed`);
        res.status(200).json({ message: `Session ${sessionId} has been trimmed` });
    });

    app.post('/vanguard', (req, res) => {
        const { userId } = req.body;
        if (!userId) {
            console.error("Invalid user data received for vanguard");
            return res.status(400).json({ message: 'Invalid user data' });
        }
        console.log(`Vanguard check for user ${userId}`);
        if(!vanguard[userId]) {
            vanguard[userId] = { actions: 0, firstAction: Date.now(), recentAction: null };
        } 
        vanguard[userId].actions++;
        vanguard[userId].recentAction = Date.now();
        if (vanguard[userId].actions >= 12) {
            if (vanguard[userId].recentAction - vanguard[userId].firstAction < 60000) {
                console.log("User flagged for excessive actions");
                fs.appendFile('./server/services/vanguard.txt', `User ${userId} flagged for excessive actions at ${Date.now()}\n`, (err) => {
                    if (err) {
                        console.error('Failed to write to vanguard log:', err);
                    }
                });
            }
            vanguard[userId].firstAction = Date.now();
            vanguard[userId].actions = 0;
        }
    });
};

module.exports = {
    trimmerRoutes,
    sessions
};