import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom';

// The hyperlinks in the NavBar contain a lot of repeated formatting code so a
// helper component NavText local to the file is defined to prevent repeated code.
function NavText({ href, text, isMain }) {
  return (
    <Typography
      variant={isMain ? 'h5' : 'h7'}
      noWrap
      style={{
        marginRight: '30px',
          fontFamily: 'Roboto Condensed',
        fontWeight: 700,
          letterSpacing: '0.15rem',

      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  )
}

// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.
export default function NavBar() {
    const logoUrl = "https://pngimg.com/uploads/nba/nba_PNG22.png"; 
  return (
      <AppBar position='static' color='secondary' style={{ "background-image": "linear-gradient(to right, #00395d, #e57373)" }}>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <img src={logoUrl} alt="NBA Logo" style={{ marginRight: '20px', height: '30px', filter: 'invert(100%)' }} />
          <NavText href='/' text='FANTASY' isMain />
          <NavText href='/albums' text='Trade' />
          <NavText href='/songs' text='Simulate Games' />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
