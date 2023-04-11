const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3030;
const cors = require('cors');
require('dotenv').config();
const usersRoute = require('./routes/users');
const loginRoute = require('./routes/login');
const projectsRoute = require('./routes/projects');


app.use(express.json())
app.use(cors());
app.use('/', usersRoute);
app.use('/', loginRoute);
app.use('/', projectsRoute);


mongoose.connect(process.env.MONGODB_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Errore di connessione'));
db.once('open', () => {
    console.log('Database connesso'); 
});

app.listen(port, () => {
    console.log(`Server avviato sulla porta ${port}`);
})