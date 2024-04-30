const cors = require("cors");
const express = require("express");
const config = require("./config");
const routes = require("./routes");
const {
  teamInfo,
  getTeams,
  getActivePlayers,
  tradePageSearch,
  tradePageTradingCard,
  playerName,
  updatePlayerTeam,
  teamGames,
  comparison,
  updateResult,
  gameResult,
  comparison1,
} = require("./routes");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json()); // Middleware to parse JSON bodies

// API Endpoints
app.get("/teams/:type", teamInfo); // Get team name or location by type
app.get("/teams", getTeams); // Get list of all teams
app.get("/players/active", getActivePlayers); // Get active players
// app.get('/trade_page_search', tradePageSearch); // Fuzzy search for players
app.get("/trade_page_trading_card/:person_id", tradePageTradingCard); // Get all players from same team as person_id
app.get("/player_name/:name", playerName); // Get player info by name
app.put("/player/:id/team", updatePlayerTeam); // Update player's team
app.get("/team_games/:user_team_id", teamGames); // Get games for a team
app.get("/comparison/:game_id", comparison); // Get comparison for game simulation
app.post("/update_result", updateResult); // Add simulation result to database
app.get("/game_result/:game_id", gameResult); // Get game result by game_id
app.get("/comparison1/:game_id", comparison1); // Get position importance from previous season

app.listen(config.server_port, () => {
  console.log(
    `Server running at http://${config.server_host}:${config.server_port}/`
  );
});

module.exports = app;
