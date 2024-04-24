import { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
const config = require('../config.json');

export default function TeamCard({ teamName, handleClose }) {
    const [teamData, setTeamData] = useState(null);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/teams`)
            .then(res => res.json())
            .then(allTeams => {
                // Filter the team data to find the specific team by name
                const specificTeam = allTeams.find(team => team.full_name === teamName);
                if (specificTeam) {
                    setTeamData(specificTeam);
                } else {
                    console.log('No matching team found');
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
            });
    }, [teamName]);  // Dependency array includes teamName to refetch when it changes

    return (
        <Modal
            open={true}
            onClose={handleClose}
            aria-labelledby="team-modal-title"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            <Box
                p={3}
                style={{ background: 'white', borderRadius: '16px', border: '2px solid #607D8B', width: 600 }}
            >
                {teamData ? (
                    <>
                        <Typography id="team-modal-title" variant="h4" style={{ color: '#607D8B', display: 'flex', alignItems: 'center' }}>
                            <img src={`/logos/${encodeURIComponent(teamData.full_name)}.png`} alt={`${teamData.full_name} logo`} onError={(e) => e.target.src = '/logos/default.png'} style={{ width: '50px', marginRight: '10px' }} />
                            {teamData.full_name}
                        </Typography>
                        <p></p>
                        <Typography variant="h7">Head Coach: {teamData.headcoach}</Typography>
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
            </Box>
        </Modal>
    );
}