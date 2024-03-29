const express = require('express');
const { route } = require('./route/user');
const { Blog } = require('./route/Blog');
const { Comment } = require('./route/comment');

const PORT = 6000;
const app = express();
require('./database/database');

app.use(express.json());
app.use('/', route);
app.use('/', Blog);
app.use('/', Comment);

app.listen(PORT, () => {
    console.log('app listening on PORT ' + PORT)
});
