const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const { route } = require('./route/User');
const { Blog } = require('./route/Blog');
const { Comment } = require('./route/comment');

const app = express();
require('./database/database');

app.use(express.json());
app.use('/', route);
app.use('/', Blog);
app.use('/', Comment);

app.listen(process.env.PORT, () => {
    console.log('app listening on PORT ' + process.env.PORT)
});
