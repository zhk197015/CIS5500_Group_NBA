import React, {useEffect, useState} from 'react';
import { Container, Grid, Button,NativeSelect, TextField,InputAdornment,Stack,Card, DialogTitle,Modal,Dialog, Paper, Select, MenuItem, FormControlLabel,Radio,Box, List ,ListItemButton,ListItemText} from '@mui/material';
import { styled } from '@mui/material/styles';

import { DataGrid } from '@mui/x-data-grid';
import SongCard from '../components/SongCard';
import config from "../config.json";
import axios from "axios";

 function  TradePage() {
  useEffect( () => {
      fetch(`http://${config.server_host}:${config.server_port}/teamlists`)
          .then(res => res.json())
          .then(resJson => {
              if (Array.isArray(resJson)){
                  setTeamList(resJson)
              }
          });
  }, []);
  
  const [teamList, setTeamList] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);


  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setModalOpen(true);
  };

  const handleTrade = () => {
    const success = Math.random() < 0.5;
    alert(success ? 'Trade successful!' : 'Trade failed.');
    setModalOpen(false);
  };

  const [searchForm , SetSearchForm] = useState({})
  const [playerList, setPlayerList] = useState([])
     const [playerInfo, setPlayerInfo] = useState({});
     const [detailPlayerInfo, setDetailPlayerInfo] = useState({});
 const [playerInfoList, setPlayerInfoList] = useState([]);
 const [onShow, setOnShow] = useState(false)
     const [team, setTeam] = useState('')
     const [ playerId, setPlayerId] = useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const handleSubmit = () =>{
    console.log(searchForm,1,`http://${config.server_host}:${config.server_port}/trade_page_search`)
    let paramsArray = [];
    let url = `http://${config.server_host}:${config.server_port}/trade_page_search`
    Object.keys(searchForm).forEach(key => paramsArray.push(key + '=' + searchForm[key]))
    if (url.search(/\?/) === -1) {
      url += '?' + paramsArray.join('&')
    } else {
      url += '&' + paramsArray.join('&')
    }
    fetch(url)
        .then(res => res.json())
        .then(resJson => {
          if (Array.isArray(resJson)){
              console.log(resJson)
              setPlayerInfoList(resJson)
          }
        });

  }
  const handleTeamSearch = ()=>{
      fetch(`http://${config.server_host}:${config.server_port}/team_players/`+team)//1610612737
          .then(res => res.json())
          .then(resJson => {
              if (Array.isArray(resJson)){
                  setPlayerList(resJson)

              }
          });
  }
  const handleTransaction = ()=>{
      console.log(playerId>=0)
      if (!playerId&&!team) return  alert('please select a player')
      if (!team) return  alert('please select team')
      if (Math.ceil(Math.random()*10)>5){
          setTimeout(()=>{
              setPlayerList([...playerList, {...playerInfo,player_name:playerInfo.first_name + playerInfo.last_name}])
          },1000)
          alert('trade successful!')
      }else{
          alert('trade unsuccessful!')
      }

  }
  const handleDetail = (e)=>{
      setDetailPlayerInfo(e)
      setOnShow(true)
  }
  const handleEmpty = ()=>{
      SetSearchForm({})
      setPlayerInfoList([])
  }
  const handleListItemClick = (event, index,) => {setSelectedIndex(index);};

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    flexGrow: 1,
  }));
  return (
    <Container >
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
                label="heighest weight"
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
            {/*<Button variant="contained" style={{marginLeft:'5px'}} onClick={handleEmpty}>清空</Button>*/}
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={4}>
            <Select
                style={{minWidth: '60%'}}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="team"
                onChange={(e)=>{
                    setTeam(e.target.value)
                }}
            >

                {teamList && teamList.map((item,index) => (
                    <MenuItem value={item.id}>{item.full_name}</MenuItem>
                ))
                }
            </Select>


            {/*<TextField*/}
            {/*    label="team"*/}
            {/*    id="standard-start-adornment"*/}
            {/*    onChange={(e)=>{*/}
            {/*        setTeam(e.target.value)*/}
            {/*    }}*/}
            {/*    variant="standard"*/}
            {/*/>*/}
            <Button style={{marginLeft: '10px'}} variant="contained" onClick={handleTeamSearch}>search</Button>
            <Box sx={{  bgcolor: 'background.paper' }} style={{maxHeight:'50vh', overflow:"auto" }}>
            <List component="nav" aria-label="secondary mailbox folder">
              {playerList.map((player) => (
                  <ListItemButton
                      style={{boxShadow: '2px 2px 4px 1px rgba(0,0,0,.1)'}}
                      // selected={selectedIndex === player.id}
                      // onClick={(event) => handleListItemClick(event, player.id)}
                  >
                    <ListItemText primary={player.player_name}/>
                  </ListItemButton>
              ))}
            </List>
          </Box>
        </Grid>
        <Grid item xs={8}>
            <Box sx={{  bgcolor: 'background.paper' }} style={{maxHeight:'50vh', overflow:"auto" }}>
                {/*<RadioGroup*/}
                {/*    aria-labelledby="demo-radio-buttons-group-label"*/}
                {/*    defaultValue="female"*/}
                {/*    name="radio-buttons-group"*/}
                {/*>*/}
                {/*    {playerInfoList.map((player)=>(*/}
                {/*        <FormControlLabel value={player.person_id} control={<Radio />} label={player.first_name + "  "+ player.last_name} />*/}
                {/*        )*/}
                {/*    )*/}

                {/*    }*/}
                {/*</RadioGroup>*/}
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

            <Button style={{marginTop: '10px',display:'flex', justifyContent:'center'}} variant="contained" onClick={handleTransaction}>Trade</Button>

        </Grid>

      </Grid>
        <Dialog onClose={()=> setOnShow(false)} open={onShow}>
            <DialogTitle>PlayerInformation</DialogTitle>
            <Box  sx={{ bgcolor: 'background.paper',padding:'20px'}}>
              {/*<Card sx={{}} >*/}
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
              {/*</Card>*/}
            </Box>
            <Button style={{marginTop: '10px',display:'flex', justifyContent:'center'}} variant="contained" onClick={()=> setOnShow(false)}>Confirm</Button>

        </Dialog>

      {/* UI and logic */}
      {/* ... */}
      {/*{selectedPlayer && (*/}
      {/*  <Modal*/}
      {/*    open={modalOpen}*/}
      {/*    onClose={() => setModalOpen(false)}*/}
      {/*  >*/}
      {/*    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>*/}
      {/*      /!*<PlayersCard player={selectedPlayer} handleClose={() => setModalOpen(false)} />*!/*/}
      {/*      <Button onClick={handleTrade} style={{ marginTop: 20 }}>Trade</Button>*/}
      {/*    </Box>*/}
      {/*  </Modal>*/}
      {/*)}*/}
    </Container>
  );
}

export default TradePage;
