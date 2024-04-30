import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, red } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import AlbumsPage from './pages/AlbumsPage';
import SongsPage from './pages/SongsPage';
import AlbumInfoPage from './pages/AlbumInfoPage'
import SimulationPage from "./pages/SimulationPage";

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: red,
    },
    typography: {
        fontFamily: [
            'Roboto Condensed',
            'Arial',
            'sans-serif'
        ].join(','), // Use join to correctly format the font-family CSS value
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 700
    },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:album_id" element={<AlbumInfoPage />} />
          <Route path="/songs" element={<SimulationPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}