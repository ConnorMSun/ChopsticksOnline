const express = require('express');
const bodyParser = require('body-parser');
const sessionService = require('./services/sessionService');

const app = express();
const port = 3000;

app.use(bodyParser.json()); 

sessionService(app);

app.use(express.static('./public'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
