const express = require('express');

const PORT = 6000;
const app = express();
require('./database/database');

app.use(express.json());

app.listen(PORT, () => {
    console.log('app listening on PORT ' + PORT)
});