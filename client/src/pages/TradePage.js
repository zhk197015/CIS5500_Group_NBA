import React, {useEffect, useState} from 'react';
import { Container, Grid, InputLabel,Button, TextField,InputAdornment,Stack,FormControl, DialogTitle,Dialog, Paper, Select, MenuItem,Radio,Box, List ,ListItemButton,ListItemText} from '@mui/material';
import { styled } from '@mui/material/styles';

import config from "../config.json";


function TradePage() {
    // Fetches initial team list when component mounts and handles search submission
  useEffect( () => {
      handleSubmit() // Preemptively call handleSubmit to apply any existing search criteria
      fetch(`http://${config.server_host}:${config.server_port}/teamlists`)
          .then(res => res.json())
          .then(resJson => {
              if (Array.isArray(resJson)) { // Check if response is an array
                  setTeamList(resJson)   // Update state with team list
              }
          });
  }, []);
  
    const [teamList, setTeamList] = useState([]);  // State to hold list of teams

    // State hooks for managing search parameters and results
    const [searchForm, SetSearchForm] = useState({});  // State for storing search form input
    const [playerList, setPlayerList] = useState([]);  // State to hold list of players in a team
    const [playerInfo, setPlayerInfo] = useState({});  // State to hold individual player information
    const [detailPlayerInfo, setDetailPlayerInfo] = useState({});  // State for detailed player information in a dialog
    const [playerInfoList, setPlayerInfoList] = useState([]);  // State to hold list of players from search results
    const [onShow, setOnShow] = useState(false);  // State to control visibility of the detail dialog
    const [team, setTeam] = useState('');  // State to hold selected team ID
    const [playerId, setPlayerId] = useState('');  // State to hold selected player ID

    // Handles form submission for player search
  const handleSubmit = () =>{
    let paramsArray = [];
    let url = `http://${config.server_host}:${config.server_port}/trade_page_search`
    Object.keys(searchForm).forEach(key => paramsArray.push(key + '=' + searchForm[key]))
    if (url.search(/\?/) === -1) {
        url += '?' + paramsArray.join('&')  // Append parameters to URL
    } else {
      url += '&' + paramsArray.join('&')
    }
    fetch(url)
        .then(res => res.json())
        .then(resJson => {
          if (Array.isArray(resJson)){
              console.log(resJson)
              setPlayerInfoList(resJson)  // Update state with search results
          }
        });

  }
  //Return a list of team players
  const handleTeamSearch = ()=>{
      fetch(`http://${config.server_host}:${config.server_port}/team_players/`+team)//1610612737
          .then(res => res.json())
          .then(resJson => {
              if (Array.isArray(resJson)){
                  setPlayerList(resJson)  // Update player list with fetched data

              }
          });
  }
  //trade the player into the team list
  const handleTransaction = ()=>{
      console.log(playerId>=0)
      if (!playerId && !team) return alert('please select a player')  // Validation for selections
      if (!team) return  alert('please select team')
      if (Math.ceil(Math.random() * 10) > 5) {   // Simulate a trade success condition
          setTimeout(()=>{
              setPlayerList([...playerList, {...playerInfo,player_name:playerInfo.first_name + "  " + playerInfo.last_name}])
          },1000)
          alert('trade successful!')
      }else{
          alert('trade unsuccessful!')
      }

  }
    // Opens detail dialog for player
    const handleDetail = (e) => {
        setDetailPlayerInfo(e);  // Set detailed information for player
        setOnShow(true);  // Show detail dialog
    };
 

    // Styled component for displaying items
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    flexGrow: 1,
  }));

    // Main render block for the TradePage component
  return (
    <Container >
      <h2>Search Player</h2>  
      <Box   sx={{padding: '20px', marginBottom: '10px' }} >
        <Grid container  spacing={2}  flex={{justifyContent:"flex-end"}}>
          <Grid  item  xs={4}>
            <TextField
                label="lowest height"
                id="standard-start-adornment"
                onChange={(e)=>{
                  SetSearchForm({...searchForm, height_low:e.target.value})
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                }}
                variant="standard"
            />
            <>     </>
            <TextField
                label="highest height"
                id="standard-start-adornment"
                onChange={(e)=>{
                  SetSearchForm({...searchForm, height_high:e.target.value})
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                }}
                variant="standard"
            />

          </Grid>
          <Grid item xs={4}>

            <TextField
                label="smallest age"
                id="standard-start-adornment"
                onChange={(e)=>{
                  SetSearchForm({...searchForm, age_low:e.target.value})
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">yrs</InputAdornment>,
                }}
                variant="standard"
            />
            <>     </>
            <TextField
                label="biggest age"
                id="standard-start-adornment"
                onChange={(e)=>{
                  SetSearchForm({...searchForm, age_high:e.target.value})
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">yrs</InputAdornment>,
                }}
                variant="standard"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
                label="lowest weight"
                id="standard-start-adornment"
                onChange={(e)=>{
                  SetSearchForm({...searchForm, weight_low:e.target.value})
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">lbs &nbsp; &nbsp; </InputAdornment>,
                }}
                variant="standard"
            />
            <>     </>
            <TextField
                label="highest weight"
                id="standard-start-adornment"
                onChange={(e)=>{
                  SetSearchForm({...searchForm, weight_high:e.target.value})
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">lbs &nbsp;&nbsp;</InputAdornment>,
                }}
                variant="standard"
            />
          </Grid>
          <Grid item>
            <Button variant="contained"  onClick={handleSubmit}>Search</Button>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={4}>
        <FormControl sx={{ m: 1, minWidth: '60%' }} size="small">
            <InputLabel id="demo-select-small-label">Please select a team</InputLabel>
            <Select
                style={{minWidth: '60%'}}
                labelId="demo-select-small-label"
                id="demo-select-small"
                label="Please select a team"
                onChange={(e)=>{
                    setTeam(e.target.value)
                }}
            >

                {teamList && teamList.map((item,index) => (
                    <MenuItem value={item.id}>{item.full_name}</MenuItem>
                ))
                }
            </Select>
          </FormControl>
          <Button style={{margin: '10px 0 0 10px'}} variant="contained" onClick={handleTeamSearch}>search</Button>
            <Box sx={{  bgcolor: 'background.paper' }} style={{maxHeight:'50vh', overflow:"auto" }}>
            <List component="nav" aria-label="secondary mailbox folder">
              {playerList.map((player) => (
                  <ListItemButton
                      style={{boxShadow: '2px 2px 4px 1px rgba(0,0,0,.1)'}}
                  >
                    <ListItemText primary={player.player_name}/>
                  </ListItemButton>
              ))}
            </List>
          </Box>
        </Grid>
        <Grid item xs={8}>
            <Box sx={{  bgcolor: 'background.paper' }} style={{maxHeight:'50vh', overflow:"auto" }}>
              
                <List component="nav" aria-label="secondary mailbox folder">
                    {playerInfoList.map((player) => (
                        <Grid container style={{    alignItems: 'center'}}>
                        <Radio
                            checked={playerId === player.person_id}
                            onChange={(e)=>{
                                setPlayerId(player.person_id)
                                setPlayerInfo(player)
                            }}
                            value="a"
                            name="radio-buttons"
                            inputProps={{ 'aria-label': 'A' }}
                        />
                        <ListItemText primary={player.first_name + "  "+ player.last_name}/>
                            <Button  variant="contained" onClick={()=>handleDetail(player)}>detail information</Button>
                        </Grid>
                    ))}
                </List>
            </Box>

            <Button style={{margin: '10px 20px 0 auto' ,display:'flex', }} variant="contained" onClick={handleTransaction}>Trade</Button>

        </Grid>
      </Grid>
        <Dialog onClose={()=> setOnShow(false)} open={onShow}>
            <DialogTitle>PlayerInformation</DialogTitle>
            <Box  sx={{ bgcolor: 'background.paper',padding:'20px'}}>
                  <>
                <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap flexWrap="wrap">
                  <Item>Name: {detailPlayerInfo.first_name + detailPlayerInfo.last_name}</Item>
                  <Item>Height: {detailPlayerInfo.height_cm} cm</Item>
                  <Item>weight: {detailPlayerInfo.weight} </Item>
                  <Item>Age: {detailPlayerInfo.age}</Item>
                  <Item>Date of Birth: {detailPlayerInfo.birthdate}</Item>
                  <Item>Country: {detailPlayerInfo.country}</Item>
                  <Item>Position: {detailPlayerInfo.position}</Item>
                  <Item>School: {detailPlayerInfo.school}</Item>
                </Stack>
                  </>
            </Box>
            <Button style={{marginTop: '10px',display:'flex', justifyContent:'center'}} variant="contained" onClick={()=> setOnShow(false)}>Confirm</Button>

        </Dialog>

    </Container>
  );
}

export default TradePage;
