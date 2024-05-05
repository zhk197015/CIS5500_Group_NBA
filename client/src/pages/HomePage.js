import { useEffect, useState } from "react";
import {
  Container,
  Divider,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import TeamCard from "../components/TeamCard";
const config = require("../config.json");

export default function HomePage() {
  const [locations, setLocations] = useState({});
  const [selectedTeamName, setSelectedTeamName] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

    // useEffect hook to fetch team names and locations from the server when the component mounts.
  useEffect(() => {
    Promise.all([
      fetch(
        `http://${config.server_host}:${config.server_port}/teams/name`
      ).then((res) => res.json()),
      fetch(
        `http://${config.server_host}:${config.server_port}/teams/location`
      ).then((res) => res.json()),
    ]).then(([names, locations]) => {
        // Process the fetched data to group teams by their conference locations.
      const locationGroups = names.reduce((acc, team, index) => {
          const location = locations[index].conferences;
          // Check if the location key exists in the accumulator.
        if (!acc[location]) {
          acc[location] = [];
          }
          // Append team details to the corresponding location in the accumulator.
        acc[location].push({
          id: team.id,
          name: team.full_name,
          logoPath: `/logos/${encodeURIComponent(team.full_name)}.png`, // Construct logo path here
        });
        return acc;
      }, {});
        setLocations(locationGroups); // Update the locations state with grouped team data.
    });
  }, []);

    // Function to handle user interaction when a team card is clicked.
  const handleOpenTeamCard = (team) => {
      console.log(team);  // Log the team object to the console for debugging.
      setSelectedTeamId(team.id);  // Set the selected team's ID.
      setSelectedTeamName(team.name);  // Set the selected team's name.
  };

    // Function to reset the selected team information, closing the team card display.
  const handleCloseTeamCard = () => {
    setSelectedTeamName(null);
  };

    // Render the HomePage component.
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
                  <Button onClick={() => handleOpenTeamCard(team)}>
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
      {/* Conditional rendering of TeamCard */}
      {selectedTeamName && (
        <TeamCard
          teamId={selectedTeamId}
          teamName={selectedTeamName}
          handleClose={handleCloseTeamCard}
        />
      )}
    </Container>
  );
}
