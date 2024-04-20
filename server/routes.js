const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

/******************
 * ALL ROUTES *
 ******************/

// Route 1: GET /teams/:type
// Retrieves either the team name or location based on the 'type' parameter. Validates the 
// 'type' parameter to ensure it's either 'name' or 'location'.

const teamInfo = function (req, res) {
  const type = req.params.type;
  const validTypes = {
      'name': 'team.full_name',
      'location': 'team_locations.conferences'
  };

  // Validate the 'type' parameter
  if (!validTypes[type]) {
      res.status(400).json({ error: "Invalid type specified. Use 'name' or 'location'." });
      return;
  }

  // Construct the SQL query dynamically based on the 'type' parameter
  const query = `
      SELECT ${validTypes[type]}
      FROM team, team_locations
      WHERE team.id = team_locations.id
      ORDER BY team_locations.conferences`;

  // Execute the query using the connection object
  connection.query(query, (err, results) => {
      if (err) {
          // Log the error and send a 500 Internal Server Error response
          console.error('Database query error:', err);
          res.status(500).json({ error: 'Error querying the database' });
          return;
      }
      // Check if the results array is empty, which means no records found
      if (results.length === 0) {
          // Send a 404 Not Found response if no data is found
          res.status(404).json({ message: 'No data found' });
          return;
      }
      // Send the results as a JSON response
      res.json(results);
  });
};

// Route 2: GET /teams
// Retrieves a list of teams with their details, ordered by the year founded.
const getTeams = function (req, res) {
  connection.query(`
    SELECT t.full_name, td.headcoach, t.year_founded, td.arena, t.state, t.city, t.abbreviation
    FROM team_details td JOIN team t ON t.id = td.team_id
    ORDER BY t.year_founded
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log('Error fetching teams:', err);
      res.json({});
    } else {
      res.json(data);
    }
  });
};

// Route 3: GET /players/active
// Retrieves a list of active players with their common information.
const getActivePlayers = function (req, res) {
  connection.query(`
    SELECT cpi.age, cpi.school, cpi.country, p.first_name, p.last_name, 
           cpi.actual_height, cpi.weight, cpi.actual_position, 
           cpi.draft_round, cpi.draft_number
    FROM common_player_info cpi JOIN player p ON cpi.person_id = p.id
    WHERE cpi.rosterstatus = 'Active'
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log('Error fetching active players:', err);
      res.json({});
    } else {
      res.json(data);
    }
  });
};

// Route 4: GET /trade_page_search
// Return a player based on fuzzy search on height, weight, age, position, and team
const tradePageSearch = function (req, res) {
  // Extract search parameters from query string
  // Construct SQL query to perform a fuzzy search on player attributes
  // Execute the query and return the matching player's details
};

// Route 5: GET /trade_page_trading_card/:person_id
// Get all players in the team given a person_id
const tradePageTradingCard = function (req, res) {
  // Construct SQL query to retrieve all players from the same team as the given person_id
  // Execute the query and return all players' details
};

// Route 6: GET /player_name/:name
// Use a query to get all info for a given player by name
const playerName = function (req, res) {
  // Construct SQL query to fetch specific player details by name
  // Execute query and return the player's details
};

// Route 7: PUT /player/:id/team
// Given a player_id, update the player's team to a new team
const updatePlayerTeam = function (req, res) {
  // Construct SQL query to update the player's team
  // Execute the update query and handle the response
  const person_id = req.params.your_given_person_id;

  connection.query(`
  UPDATE common_player_info
  SET team_name = 'new_team_name'
  WHERE person_id = ?
  `, [person_id], 
  (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
};

// Route 8: GET /team_games/:user_team_id
// Return a list of games that the team will need to play, ordered by some criteria
const teamGames = function (req, res) {
  // Construct SQL query to get the upcoming games for the team
  // Execute the query and return the list of games
};

// Route 9: GET /comparison/:game_id
// Filter out the previous game details and get important player stats for simulation
const comparison = function (req, res) {
  // Construct SQL query to get previous game details and important player positions
  // Execute the query and return player heights and weights for those positions
};

// Route 10: POST /update_result
// Add simulation result to the result table
const updateResult = function (req, res) {
  // Extract result data from request body
  // Construct SQL query to insert simulation result into the result table
  // Execute the insertion and handle the database response
  connection.query(`
  INSERT INTO game_result(user_team, opponent_team, user_team_result, opponent_team_result)
  VALUES ('User Team Name', 'Opponent Team Name', user_team_score, opponent_team_score)
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
};

// Route 11: GET /game_result/:game_id
// Get result of a specific game
const gameResult = function (req, res) {
  // Construct SQL query to fetch the result of the specified game
  // Execute and handle the query response
  connection.query(`
  SELECT user_team, sum(user_team_result), COUNT(user_team_result)
  FROM game_result
  GROUP BY user_team
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
};

module.exports = {
  teamInfo,
  createTeam,
  updateTeam,
  deleteTeam,
  getAllPlayers,
  getPlayer,
  addPlayer,
  updatePlayer,
  deletePlayer,
  getAllMatches,
  getMatch
};
