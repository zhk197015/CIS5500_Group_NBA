const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));


app.use(express.json()); // Middleware to parse JSON bodies

// Define API endpoints and attach the corresponding route handlers
app.get('/teams/:type', routes.teamInfo);
app.post('/team', routes.createTeam);
app.put('/team/:id', routes.updateTeam);
app.delete('/team/:id', routes.deleteTeam);
app.get('/players', routes.getAllPlayers);
app.get('/player/:id', routes.getPlayer);
app.post('/player', routes.addPlayer);
app.put('/player/:id', routes.updatePlayer);
app.delete('/player/:id', routes.deletePlayer);
app.get('/matches', routes.getAllMatches);
app.get('/match/:id', routes.getMatch);

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;