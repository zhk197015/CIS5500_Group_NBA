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

// // Route 4: GET /trade_page_search
// // Return a player based on fuzzy search on height, weight, age, position, and team
// const tradePageSearch = function (req, res) {
//   // Extract search parameters from query string
//   // Construct SQL query to perform a fuzzy search on player attributes
//   // Execute the query and return the matching player's details
//   const weightLow = req.query.weight_low ?? 164;
//   const weightHigh = req.query.weight_high ?? 290;
//   const ageLow = req.query.age_low ?? 21;
//   const ageHigh = req.query.age_high ?? 44;
//   const heightLow = req.query.age_low ?? 30.48;
//   const heightHigh = req.query.age_high ?? 231.14;
// };
// connection.query(`
// WITH msy_height AS (select person_id,first_name,last_name, (CAST(SUBSTRING_INDEX(actual_height, "'", 1) AS UNSIGNED) * 30.48) +
// (CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(actual_height, "'", -1), '"', 1) AS UNSIGNED) * 2.54) AS height_cm
// FROM common_player_info)
// SELECT *
// FROM common_player_info, msy_height
// WHERE common_player_info.person_id= msy_height.person_id
// AND common_player_info.team_name LIKE '%${team_name}%'
//   AND common_player_info.position LIKE '%${position}%'
//   AND msy_height.height_cm >= ${heightLow}
//   AND msy_height.height_cm <= ${heightHigh}
//   AND common_player_info.weight >= ${weightLow}
//   AND common_player_info.weight <= ${weightHigh}
//   AND common_player_info.age >= ${ageLow} AND common_player_info.age <= ${ageHigh}
// ORDER BY team_name ASC;
//   `, (err, data) => {
//     if (err || data.length === 0) {
//       console.log(err);
//       res.json([]);
//     } else {
//       res.json(data);
//     }
//   });
// Route 5: GET /trade_page_trading_card/:person_id
// Get all players in the team given a person_id
const tradePageTradingCard = function (req, res) {
  // Construct SQL query to retrieve all players from the same team as the given person_id
  // Execute the query and return all players' details
  const person_id = req.params.your_given_person_id;

  connection.query(
    `
  WITH team_player as(SELECT team.full_name AS team_name, team.abbreviation,
    concat(common_player_info.first_name,' ', common_player_info.last_name) AS player_name
FROM team,common_player_info
WHERE team.abbreviation=common_player_info.team_abbreviation
order by team.full_name)
SELECT team_player.team_name,team_player.player_name
FROM team_player, common_player_info
WHERE team_player.abbreviation = common_player_info.team_abbreviation
AND person_id = ?
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
AND id = ?
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
    `
        WITH tem1 AS (
SELECT
    *
FROM
    play_by_play_test
WHERE
    game_id='${user_current_game_id}'
),
tem2 AS(
SELECT
    person1type AS position,
    COUNT(person1type) AS hl_position
FROM
    tem1
GROUP BY
    person1type
ORDER BY
    COUNT(person1type) DESC
LIMIT 3
),
tem3 AS (
SELECT
    *
FROM
    common_player_info
WHERE
    team_id IN (
        SELECT
            home_team_id
        FROM
            game_summary
        WHERE
            game_id = '${user_current_game_id}'
        UNION
        SELECT
            visitor_team_id
        FROM
            game_summary
        WHERE
            game_id = '${user_current_game_id}'
)),
tem4 AS(
SELECT
    CASE
        WHEN AVG(actual_height) >= (
            SELECT
                MAX(average_height)
            FROM
                (
                    SELECT
                        AVG(actual_height) as average_height, tem2.position
                    FROM
                        tem2
                    INNER JOIN
                        tem3 ON tem2.position = tem3.position_id
                    GROUP BY
                        tem2.position
                ) AS max_height
            WHERE tem2.position=max_height.position
            GROUP BY
                max_height.position
        ) THEN 1
        ELSE 0
    END AS taller,
    CASE
        WHEN AVG(weight) >= (
            SELECT
                MAX(average_weight)
            FROM
                (
                    SELECT
                        AVG(weight) as average_weight, tem2.position
                    FROM
                        tem2
                    INNER JOIN
                        tem3 ON tem2.position = tem3.position_id
                    GROUP BY
                        tem2.position
                ) AS max_weight
            WHERE tem2.position=max_weight.position
            GROUP BY
                max_weight.position
        ) THEN 1
        ELSE 0
    END AS heavier,
    AVG(actual_height) AS average_height,
    AVG(weight) AS average_weight,
    team_id,
    tem2.position
FROM
    tem2
INNER JOIN
    tem3 ON tem2.position = tem3.position_id
GROUP BY
    team_id, tem2.position)
SELECT
    taller+heavier AS total,
    team_id
FROM tem4
GROUP BY team_id
ORDER BY
    team_id desc`,
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
WITH tem1 AS (
    SELECT
        person1type AS position,
        COUNT(person1type) AS hl_position
    FROM
        play_by_play_test
    GROUP BY
        person1type
    ORDER BY
        COUNT(person1type)
    LIMIT 2
),
tem2 AS (
    SELECT
        *
    FROM
        common_player_info
    WHERE
        team_id IN (
            SELECT
                home_team_id
            FROM
                game_summary
            WHERE
                game_id = '${user_current_game_id}'
            UNION
            SELECT
                visitor_team_id
            FROM
                game_summary
            WHERE
                game_id = '${user_current_game_id}'
        )
),
tem3 AS (
    SELECT
        CASE
            WHEN AVG(actual_height) >= (
                SELECT
                    MAX(average_height)
                FROM
                    (
                        SELECT
                            AVG(actual_height) AS average_height, tem1.position
                        FROM
                            tem1
                        INNER JOIN
                            tem2 ON tem1.position = tem2.position_id
                        GROUP BY
                            tem1.position
                    ) AS max_height
                WHERE
                    tem1.position = max_height.position 
                GROUP BY
                    max_height.position
            ) THEN 1
            ELSE 0
        END AS taller,
        CASE
            WHEN AVG(weight) >= (
                SELECT
                    MAX(average_weight)
                FROM
                    (
                        SELECT
                            AVG(weight) AS average_weight, tem1.position
                        FROM
                            tem1
                        INNER JOIN
                            tem2 ON tem1.position = tem2.position_id
                        GROUP BY
                            tem1.position
                    ) AS max_weight
                WHERE
                    tem1.position = max_weight.position 
                GROUP BY
                    max_weight.position
            ) THEN 1
            ELSE 0
        END AS heavier,
        AVG(actual_height) AS average_height,
        AVG(weight) AS average_weight,
        team_id,
        tem1.position
    FROM
        tem1
    INNER JOIN
        tem2 ON tem1.position = tem2.position_id
    GROUP BY
        team_id, tem1.position
)

SELECT
    taller + heavier AS total,
    team_id
FROM
    tem3
GROUP BY
    team_id
ORDER BY
    team_id desc
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
  // tradePageSearch,
  tradePageTradingCard,
  playerName,
  updatePlayerTeam,
  teamGames,
  comparison,
  updateResult,
  gameResult,
  comparison1,
};
