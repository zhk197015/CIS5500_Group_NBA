import axios from "axios";
import React, { useState, useEffect } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Divider,
  Container,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
  // Link,
  // Stack,
  // Table,
  // TableRow,
  // TableBody,
  // TableCell,
  // TableHead,
  // TableContainer,
} from "@mui/material";
import { useImmer } from "use-immer";
// import { formatDuration, formatReleaseDate } from "../helpers/formatter";

const config = require("../config.json");

const SimulationPage = () => {
  const [step, setStep] = useState(1);
  const [loadingGame, setLoadingGame] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [teamGames, setTeamGames] = useImmer([]);

  useEffect(() => {
    const fetchTeamGames = async () => {
      setTeamGames([]);
      if (currentTeam?.id) {
        try {
          setLoadingGame(true);
          const response = await axios.get(
            `http://${config.server_host}:${config.server_port}/team_games/${currentTeam.id}`
          );
          setTeamGames(response.data);
        } catch (error) {
          setTeamGames([]);
          console.error("Error fetching team games:", error);
        } finally {
          setLoadingGame(false);
        }
      } else {
        setTeamGames([]);
      }
    };
    fetchTeamGames();
  }, [currentTeam, setTeamGames]);

  const handleSimulation = async (game) => {
    try {
      setTeamGames((draft) => {
        draft.find((item) => item.game_id === game.game_id).loading = true;
      });
      const { data: data1 } = await axios.get(
        `http://${config.server_host}:${config.server_port}/comparison/${game.game_id}`
      );
      const { data: data2 } = await axios.get(
        `http://${config.server_host}:${config.server_port}/comparison1/${game.game_id}`
      );
      const data = (Array.isArray(data1) ? data1 : []).concat(
        Array.isArray(data2) ? data2 : []
      );
      const homeTeamId = game.home_team_id;
      const homeTeamScore = data
        .filter((item) => item.team_id === homeTeamId)
        .reduce((acc, cur) => {
          return acc + cur.total;
        }, 0);
      const visitorTeamId = game.visitor_team_id;
      const visitorTeamScore = data
        .filter((item) => item.team_id === visitorTeamId)
        .reduce((acc, cur) => {
          return acc + cur.total;
        }, 0);
      setTeamGames((draft) => {
        const img =
          homeTeamScore > visitorTeamScore
            ? game.home_team_name
            : game.visitor_team_name;
        draft.find((item) => item.game_id === game.game_id).result = `<img
        alt="${img} logo"
        style="width:50px;"
        src="/logos/${encodeURIComponent(img)}.png"
      /> `;
      });
    } catch (error) {
      console.error("Error simulating game:", error);
    } finally {
      setTeamGames((draft) => {
        draft.find((item) => item.game_id === game.game_id).loading = false;
      });
    }
  };

  return step === 1 ? (
    <AllTeams setStep={setStep} setCurrentTeam={setCurrentTeam} />
  ) : (
    <div>
      <h1 style={{ textAlign: "center" }}>
        Simulation
        <span
          style={{ fontSize: 14, color: "blue", cursor: "pointer" }}
          onClick={() => setStep(1)}
        >
          &nbsp;&nbsp;back
        </span>
        {loadingGame && <Typography>Loading games...</Typography>}
      </h1>
      <table style={{ margin: "0 auto", width: "50%" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Home Team</th>
            <th>Visitor Team</th>
            <th style={{ textAlign: "center", width: 200 }}>Result</th>
            <th style={{ textAlign: "center" }}>Simulation</th>
          </tr>
        </thead>
        <tbody>
          {teamGames.map((game, index) => (
            <tr key={index}>
              <td>
                <div
                  style={{ height: 70, display: "flex", alignItems: "center" }}
                >
                  <img
                    alt={`${game.home_team_name} logo`}
                    onError={(e) => (e.target.src = "/logos/default.png")}
                    style={{ width: 50, marginRight: 10 }}
                    src={`/logos/${encodeURIComponent(
                      game.home_team_name
                    )}.png`}
                  />
                  {game.home_team_name}
                </div>
              </td>
              <td>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    alt={`${game.visitor_team_name} logo`}
                    onError={(e) => (e.target.src = "/logos/default.png")}
                    style={{ width: 50, marginRight: 10 }}
                    src={`/logos/${encodeURIComponent(
                      game.visitor_team_name
                    )}.png`}
                  />
                  {game.visitor_team_name}
                </div>
              </td>
              <td style={{ textAlign: "center" }}>
                {game.result && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    dangerouslySetInnerHTML={{ __html: game.result }}
                  />
                )}
              </td>
              <td style={{ textAlign: "center" }}>
                <LoadingButton
                  size="small"
                  variant="contained"
                  loading={game.loading === true}
                  onClick={() => handleSimulation(game)}
                >
                  Simulate
                </LoadingButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimulationPage;

const AllTeams = ({ setStep, setCurrentTeam }) => {
  const [locations, setLocations] = useState({});

  useEffect(() => {
    Promise.all([
      fetch(
        `http://${config.server_host}:${config.server_port}/teams/name`
      ).then((res) => res.json()),
      fetch(
        `http://${config.server_host}:${config.server_port}/teams/location`
      ).then((res) => res.json()),
    ]).then(([names, locations]) => {
      const locationGroups = names.reduce((acc, team, index) => {
        const location = locations[index].conferences;
        if (!acc[location]) {
          acc[location] = [];
        }
        acc[location].push({
          id: team.id,
          name: team.full_name,
          logoPath: `/logos/${encodeURIComponent(team.full_name)}.png`,
        });
        return acc;
      }, {});
      setLocations(locationGroups);
    });
  }, []);

  const handleOpenTeamCard = (team) => {
    setCurrentTeam(team);
    setStep(2);
  };

  return (
    <Container>
      <Divider />
      <h2>All Teams</h2>
      {Object.keys(locations).length > 0 ? (
        Object.entries(locations).map(([location, teams], index) => (
          <Accordion key={index}>
            <AccordionSummary>
              <Typography variant="h6" style={{ textTransform: "capitalize" }}>
                {location}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              {teams.map((team, idx) => (
                <Typography
                  key={idx}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <img
                    src={team.logoPath}
                    alt={`${team.name} logo`}
                    onError={(e) => (e.target.src = "/logos/default.png")}
                    style={{ width: "50px" }}
                  />
                  <Button loading onClick={() => handleOpenTeamCard(team)}>
                    {team.name}
                  </Button>
                </Typography>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>Loading teams...</Typography>
      )}
      <Divider />
    </Container>
  );
};
