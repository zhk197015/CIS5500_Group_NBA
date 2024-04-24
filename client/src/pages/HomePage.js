import { useEffect, useState } from 'react';
import { Container, Divider, Typography, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import TeamCard from '../components/TeamCard';
const config = require('../config.json');

export default function HomePage() {
    const [locations, setLocations] = useState({});
    const [selectedTeamName, setSelectedTeamName] = useState(null);

    useEffect(() => {
        Promise.all([
            fetch(`http://${config.server_host}:${config.server_port}/teams/name`).then(res => res.json()),
            fetch(`http://${config.server_host}:${config.server_port}/teams/location`).then(res => res.json())
        ]).then(([names, locations]) => {
            const locationGroups = names.reduce((acc, team, index) => {
                const location = locations[index].conferences;
                if (!acc[location]) {
                    acc[location] = [];
                }
                acc[location].push({
                    name: team.full_name,
                    logoPath: `/logos/${encodeURIComponent(team.full_name)}.png`  // Construct logo path here
                });
                return acc;
            }, {});
            setLocations(locationGroups);
        });
    }, []);

    const handleOpenTeamCard = (teamName) => {
        setSelectedTeamName(teamName);
    };

    const handleCloseTeamCard = () => {
        setSelectedTeamName(null);
    };

    return (
        <Container>
            <Divider />
            <h2>All Teams</h2>
            {Object.keys(locations).length > 0 ? (
                Object.entries(locations).map(([location, teams], index) => (
                    <Accordion key={index}>
                        <AccordionSummary>
                            <Typography variant="h6" style={{ textTransform: 'capitalize' }}>
                                {location}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                            {teams.map((team, idx) => (
                                <Typography key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={team.logoPath} alt={`${team.name} logo`} onError={(e) => e.target.src = '/logos/default.png'} style={{ width: '50px' }} />
                                    <Button onClick={() => handleOpenTeamCard(team.name)}>{team.name}</Button>
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
            {selectedTeamName && <TeamCard teamName={selectedTeamName} handleClose={handleCloseTeamCard} />}
        </Container>
    );
};