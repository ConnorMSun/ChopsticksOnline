const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(bodyParser.json()); 

app.use(express.static('./public'));

app.post('/save-moves', (req, res) => {
  const { moves } = req.body;
  if (!Array.isArray(moves)) {
    return res.status(400).json({ error: 'Invalid move list.' });
  }
  console.log("Received moves:", moves);
  let pushtotxt = "";
  for (const move of moves) {
    pushtotxt += `${move}\n`;
  }
  fs.writeFile('./server/services/input.txt', pushtotxt, err => {
    if (err) {
      console.error("Error saving moves:", err);
      return res.status(500).json({ error: 'Failed to save moves.' });
    }

    console.log("Moves saved to input.txt");
    res.json({ success: true });
  });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});