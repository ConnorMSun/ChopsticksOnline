const express = require('express');
const bodyParser = require('body-parser');
const { sessionRoutes, sessions } = require('./services/sessionService');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json()); 
sessionRoutes(app);

app.use(express.static('./public'));

app.get('/open-lobbies', (req, res) => {
    const openLobbies = Object.entries(sessions)
    .filter(([_, session]) => session.players.length < 2) 
    .map(([id, _]) => ({
        sessionId: id
    }));
    
    res.json(openLobbies);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});