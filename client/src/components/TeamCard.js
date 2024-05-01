import Tab from "@mui/material/Tab";
import TabList from "@mui/lab/TabList";
import Table from "@mui/material/Table";
import TabPanel from "@mui/lab/TabPanel";
import { useEffect, useState } from "react";
import TabContext from "@mui/lab/TabContext";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableContainer from "@mui/material/TableContainer";
import { Modal, Box, Typography, Button } from "@mui/material";
const config = require("../config.json");

export default function TeamCard({ teamId, teamName, handleClose }) {
  const [teamData, setTeamData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/teams`)
      .then((res) => res.json())
      .then((allTeams) => {
        // Filter the team data to find the specific team by name
        const specificTeam = allTeams.find(
          (team) => team.full_name === teamName
        );
        if (specificTeam) {
          setTeamData(specificTeam);
        } else {
          console.log("No matching team found");
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
    fetch(
      `http://${config.server_host}:${config.server_port}/players/active/${teamId}`
    )
      .then((res) => res.json())
      .then((allTeamMembers) => {
        setTeamMembers(allTeamMembers.slice(0, 15));
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, [teamName, teamId]);

  const [currentTab, setCurrentTab] = useState("1");
  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      aria-labelledby="team-modal-title"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        p={3}
        style={{
          background: "white",
          borderRadius: "16px",
          border: "2px solid #607D8B",
          width: "90%",
        }}
      >
        <TabContext value={currentTab}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange}>
              <Tab label="Team Infomation" value="1" />
              <Tab label="Team Members" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
            {teamData ? (
              <>
                <Typography
                  id="team-modal-title"
                  variant="h4"
                  style={{
                    color: "#607D8B",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={`/logos/${encodeURIComponent(teamData.full_name)}.png`}
                    alt={`${teamData.full_name} logo`}
                    onError={(e) => (e.target.src = "/logos/default.png")}
                    style={{ width: "50px", marginRight: "10px" }}
                  />
                  {teamData.full_name}
                </Typography>
                <p></p>
                <Typography variant="h7">
                  Head Coach: {teamData.headcoach}
                </Typography>
                <p>Founded: {teamData.year_founded}</p>
                <p>Arena: {teamData.arena}</p>
                <p>State: {teamData.state}</p>
                <p>City: {teamData.city}</p>
                <p>Abbreviation: {teamData.abbreviation}</p>
                <Button onClick={handleClose}>Close</Button>
              </>
            ) : (
              <Typography>Loading or No Team Data Available...</Typography>
            )}
          </TabPanel>
          <TabPanel value="2">
            <TableContainer>
              <Table
                size="small"
                sx={{ minWidth: 650 }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>School</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Height</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Draft Round</TableCell>
                    <TableCell>Draft Number</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((row) => (
                    <TableRow
                      key={row.person_id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.first_name}
                      </TableCell>
                      <TableCell>{row.last_name}</TableCell>
                      <TableCell>{row.age}</TableCell>
                      <TableCell>{row.school}</TableCell>
                      <TableCell>{row.country}</TableCell>
                      <TableCell>{row.actual_height}</TableCell>
                      <TableCell>{row.actual_position}</TableCell>
                      <TableCell>{row.draft_round}</TableCell>
                      <TableCell>{row.draft_number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabContext>
      </Box>
    </Modal>
  );
}
