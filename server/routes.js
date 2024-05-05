const mysql = require("mysql");
const config = require("./config.json");

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
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
    name: "team.full_name",
    location: "team_locations.conferences",
  };

  // Validate the 'type' parameter
  if (!validTypes[type]) {
    res
      .status(400)
      .json({ error: "Invalid type specified. Use 'name' or 'location'." });
    return;
  }

  // Construct the SQL query dynamically based on the 'type' parameter
  const query = `
      SELECT team.id,${validTypes[type]}
      FROM team, team_locations
      WHERE team.id = team_locations.id
      ORDER BY team_locations.conferences`;

  // Execute the query using the connection object
  connection.query(query, (err, results) => {
    if (err) {
      // Log the error and send a 500 Internal Server Error response
      console.error("Database query error:", err);
      res.status(500).json({ error: "Error querying the database" });
      return;
    }
    // Check if the results array is empty, which means no records found
    if (results.length === 0) {
      // Send a 404 Not Found response if no data is found
      res.status(404).json({ message: "No data found" });
      return;
    }
    // Send the results as a JSON response
    res.json(results);
  });
};

// Route 2: GET /teams
// Retrieves a list of teams with their details, ordered by the year founded.
const getTeams = function (req, res) {
  connection.query(
    `
    SELECT td.team_id, t.full_name, td.headcoach, t.year_founded, td.arena, t.state, t.city, t.abbreviation
    FROM team_details td JOIN team t ON t.id = td.team_id
    ORDER BY t.year_founded
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log("Error fetching teams:", err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Route 3: GET /players/active
// Retrieves a list of active players with their common information.
const getActivePlayers = function (req, res) {
  const teamId = req.params.teamId;
  let sql = `
  SELECT cpi.person_id,cpi.team_id,cpi.age, cpi.school, cpi.country, p.first_name, p.last_name, 
         cpi.actual_height, cpi.weight, cpi.actual_position, 
         cpi.draft_round, cpi.draft_number
  FROM common_player_info cpi JOIN player p ON cpi.person_id = p.id
  WHERE cpi.rosterstatus = 'Active' and cpi.team_id= ?
`;
  connection.query(sql, [teamId], (err, data) => {
    if (err || data.length === 0) {
      console.log("Error fetching active players:", err);
      res.json({});
    } else {
      res.json(data);
    }
  });
};
// Route 3.5: GET /teamlists
// Retrieves a list of all the teams in the league.
const Teamlist = function (req, res) {
  connection.query(
      `
    select full_name, id
    From team;
  `,
      (err, data) => {
        if (err || data.length === 0) {
          console.log("Error fetching teams:", err);
          res.json({});
        } else {
          res.json(data);
        }
      }
  );
};

// Route 4: GET /trade_page_search
// Return a player based on fuzzy search on height, weight, age, position, and team
const tradePageSearch = function (req, res) {
  const weightLow = req.query.weight_low ?? 164;
  const weightHigh = req.query.weight_high ?? 290;
  const ageLow = req.query.age_low ?? 21;
  const ageHigh = req.query.age_high ?? 44;
  const heightLow = req.query.height_low ?? 30;
  const heightHigh = req.query.height_high ?? 232;

  const query = `
    WITH msy_height AS (
      SELECT person_id, first_name, last_name,
        (CAST(SUBSTRING_INDEX(actual_height, "'", 1) AS UNSIGNED) * 30.48) +
        (CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(actual_height, "'", -1), '"', 1) AS UNSIGNED) * 2.54) AS height_cm
      FROM common_player_info
    )
    SELECT *
    FROM common_player_info JOIN msy_height ON common_player_info.person_id = msy_height.person_id
    WHERE msy_height.height_cm >= ?
      AND msy_height.height_cm <= ?
      AND common_player_info.weight >= ?
      AND common_player_info.weight <= ?
      AND common_player_info.age >= ?
      AND common_player_info.age <= ?
      AND common_player_info.rosterstatus = 'Active'
    ORDER BY common_player_info.last_name ASC
    LIMIT 15;
  `;

  connection.query(query, [heightLow, heightHigh, weightLow, weightHigh, ageLow, ageHigh], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({ error: "Error querying the database" });
      return;
    }
    if (data.length === 0) {
      res.status(404).json({ message: "No players found matching the criteria" });
    } else {
      res.json(data);
    }
  });
};
// Route 5: GET /team_player
// Get all players in the team given a person_id
const get_team_players = function (req, res) {
  //  team_id
  const teamId = req.params.teamId ; 

  const query = `
    WITH team_player AS (
      SELECT
          team.full_name AS team_name,
          team.abbreviation,
          CONCAT(common_player_info.first_name, ' ', common_player_info.last_name) AS player_name
      FROM team
      JOIN common_player_info ON team.id=common_player_info.team_id
      WHERE team_id = ?
      AND common_player_info.rosterstatus = 'Active'
      ORDER BY team.full_name
    )
    SELECT DISTINCT
      team_player.team_name,
      team_player.player_name
    FROM team_player ;
  `;

  connection.query(query, [teamId], (err, data) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: "Error querying the database" });
      return;
    }
    if (data.length === 0) {
      res.status(404).json({ message: "No data found" });
    } else {
      res.json(data);
    }
  });
};

// Route 6: GET /player_name/:name
// Use a query to get all info for a given player by name
const playerName = function (req, res) {
  // Construct SQL query to fetch specific player details by name
  // Execute query and return the player's details
  const person_id = req.params.your_given_person_id;

  connection.query(
    `
  select common_player_info.age, common_player_info.school,
       common_player_info.country,player.first_name,player.last_name,
       common_player_info.actual_height,common_player_info.weight, common_player_info.actual_position,
       common_player_info.draft_round, common_player_info.draft_number
From common_player_info, player
WHERE common_player_info.person_id = player.id
AND rosterstatus = 'Active'
AND id = '${person_id}'
  `,
    [person_id],
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Route 7: PUT /player/:id/team
// Given a player_id, update the player's team to a new team
const updatePlayerTeam = function (req, res) {
  // Construct SQL query to update the player's team
  // Execute the update query and handle the response
  const person_id = req.params.your_given_person_id;

  connection.query(
    `
  UPDATE common_player_info
  SET team_name = 'new_team_name'
  WHERE person_id = ?
  `,
    [person_id],
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Route 8: GET /team_games/:user_team_id
// Return a list of games that the team will need to play, ordered by some criteria
const teamGames = function (req, res) {
  // Construct SQL query to get the upcoming games for the team
  // Execute the query and return the list of games
  const user_team_id = req.params.user_team_id;
  connection.query(
    `
        SELECT
            game_summary.game_id,
            game_summary.home_team_id,
            home_team.full_name AS home_team_name,
            game_summary.visitor_team_id,
            visitor_team.full_name AS visitor_team_name
        FROM
            game_info
            INNER JOIN
            game_summary ON game_info.game_id = game_summary.game_id
            INNER JOIN
            team AS home_team ON game_summary.home_team_id = home_team.id
            INNER JOIN
            team AS visitor_team ON game_summary.visitor_team_id = visitor_team.id
            WHERE
            game_summary.home_team_id = '${user_team_id}'
            OR
            game_summary.visitor_team_id = '${user_team_id}'`,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Route 9: GET /comparison/:game_id
// Filter out the previous game details and get important player stats for simulation
const comparison = function (req, res) {
  // Construct SQL query to get previous game details and important player positions
  // Execute the query and return player heights and weights for those positions
  const user_current_game_id = req.params.game_id;
  connection.query(
    `WITH RelevantTeams AS (
    SELECT home_team_id AS team_id
    FROM game_summary
    WHERE game_id = '${user_current_game_id}'
    UNION
    SELECT visitor_team_id
    FROM game_summary
    WHERE game_id = '${user_current_game_id}'
),
TopPositions AS (
    SELECT person1type AS position
    FROM play_by_play_test
    WHERE game_id = '${user_current_game_id}'
    GROUP BY person1type
    ORDER BY COUNT(*) DESC
    LIMIT 3
),
PlayerStats AS (
    SELECT p.team_id, p.position_id, AVG(p.actual_height) AS avg_height, AVG(p.weight) AS avg_weight
    FROM common_player_info p
    WHERE p.team_id IN (SELECT team_id FROM RelevantTeams)
    AND p.position_id IN (SELECT position FROM TopPositions)
    GROUP BY p.team_id, p.position_id
),
MaxStats AS (
    SELECT position_id, MAX(avg_height) AS max_height, MAX(avg_weight) AS max_weight
    FROM PlayerStats
    GROUP BY position_id
)
SELECT p.team_id,
       (CASE WHEN p.avg_height >= m.max_height THEN 1 ELSE 0 END +
        CASE WHEN p.avg_weight >= m.max_weight THEN 1 ELSE 0 END) AS total
FROM PlayerStats p
JOIN MaxStats m ON p.position_id = m.position_id
GROUP BY p.team_id
ORDER BY p.team_id DESC;`,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Route 10: POST /update_result
// Add simulation result to the result table
const updateResult = function (req, res) {
  // Extract result data from request body
  // Construct SQL query to insert simulation result into the result table
  // Execute the insertion and handle the database response
  connection.query(
    `
  INSERT INTO game_result(user_team, opponent_team, user_team_result, opponent_team_result)
  VALUES ('User Team Name', 'Opponent Team Name', user_team_score, opponent_team_score)
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Route 11: GET /game_result/:game_id
// Get result of a specific game
const gameResult = function (req, res) {
  // Construct SQL query to fetch the result of the specified game
  // Execute and handle the query response
  connection.query(
    `
  SELECT user_team, sum(user_team_result), COUNT(user_team_result)
  FROM game_result
  GROUP BY user_team
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Route 12: GET /comparison1/:game_id
// Filter out the previous season and find the most important position(EX:Small ball era: postion 1 and 2 is important)
const comparison1 = function (req, res) {
  // Extract result data from request body
  // Construct SQL query to insert simulation result into the result table
  // Execute the insertion and handle the database response
  const user_current_game_id = req.params.game_id;
  connection.query(
    `
WITH RelevantTeams AS (
    SELECT home_team_id AS team_id
    FROM game_summary
    WHERE game_id = '${user_current_game_id}'
    UNION
    SELECT visitor_team_id
    FROM game_summary
    WHERE game_id = '${user_current_game_id}'
),
PlayerPositions AS (
    SELECT person1type AS position, COUNT(*) AS hl_position
    FROM play_by_play_test
    GROUP BY person1type
    ORDER BY hl_position DESC
    LIMIT 2
),
PlayerInfo AS (
    SELECT p.position_id , p.team_id, AVG(p.actual_height) AS avg_height, AVG(p.weight) AS avg_weight
    FROM common_player_info p
    JOIN RelevantTeams t ON p.team_id = t.team_id
    WHERE p.position_id IN (SELECT position FROM PlayerPositions)
    GROUP BY team_id, p.position_id, team_id
),
    MaxStats AS (
    SELECT  position_id, MAX(avg_height) AS max_height, MAX(avg_weight) AS max_weight
    FROM PlayerInfo
    GROUP BY  position_id)
SELECT
       (CASE WHEN p.avg_height >= m.max_height THEN 1 ELSE 0 END +
        CASE WHEN p.avg_weight >= m.max_weight THEN 1 ELSE 0 END) AS total,
        p.team_id
FROM PlayerInfo p
JOIN MaxStats m ON p.position_id = m.position_id
group by team_id
ORDER BY p.team_id DESC;
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

module.exports = {
  teamInfo,
  getTeams,
  getActivePlayers,
  tradePageSearch,
  playerName,
  updatePlayerTeam,
  teamGames,
  comparison,
  updateResult,
  gameResult,
  comparison1,
  Teamlist,
  get_team_players
};
