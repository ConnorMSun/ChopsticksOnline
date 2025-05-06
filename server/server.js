const express = require('express');
const bodyParser = require('body-parser');
const sessionService = require('./services/sessionService');

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running with port ${port}`);
});

app.use(bodyParser.json()); 

sessionService(app);

app.use(express.static('./public'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
