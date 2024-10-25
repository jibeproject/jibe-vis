import { FC, useEffect, useState} from 'react';
import Navbar from './components/navbar';
import './App.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from '../amplify_outputs.json';
import Error404 from "./components/404-page";
import ErrorPage from "./components/error-page";
import { Intro } from './components/intro';
import { About } from './components/about/about.tsx';
import { Pathways } from './components/pathways';
import { Resources } from './components/resources';
import { Glossary } from './components/glossary';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Map from './components/vis/map/map';
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import FeedbackChat from './components/feedback_chat';
import ShareURL from './components/share';

Amplify.configure(awsconfig);

interface AppProps {}

const theme = createTheme({
  palette: {
    primary: {
      main: "#2caa4a"
    },
    secondary: {
      main: "#ffcc80"
    }
  }
});

export function useScrollToAnchor() {
  const location = useLocation();  

  useEffect(() => {
    if (location.hash === '') window.scrollTo(0, 0)
    else {
      setTimeout(() => {
        const id = location.hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({
            block: 'start',
            inline: 'nearest',
            behavior: 'smooth',
          })
        }
      }, 0)
    }
    

    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
      // console.log(location);
      // console.log(current_location.pathname+current_location.hash);
      // if (!urlUpdated && location.pathname !== '/map' || current_location.pathname !== '/map') {
      //   // console.log('test');
      //   // Clear query strings by updating the URL without triggering a navigation
      //   const newUrl = `${location.pathname}${location.hash}`;
      //   window.history.replaceState(null, '', newUrl);
      //   setUrlUpdated(true);
      // }
    };
    
  }, [location]);
}

const App: FC<AppProps> = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  useScrollToAnchor();
  return (
    <Authenticator
      hideSignUp={true}
    >
      {({ signOut, user }) => (
        <ThemeProvider theme={theme}>
        <main>
          <div className="App">
            
          <div className="sign-out">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="sign-out-popup" 
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={signOut}>Sign out ({user?.signInDetails?.loginId})</MenuItem>
              </Menu>
            </div>
              <Navbar/>
          </div>
          <ShareURL/>
          <FeedbackChat/>
        </main>
        <Routes>
          <Route  path="/" element={<Intro/>} errorElement={<ErrorPage/>}/>
          <Route  path="/about" element={<About/>} />
          <Route path="/pathways" element={<Pathways/>} />
          <Route path="/map" element={<Map/>} />
          <Route path="/glossary" element={<Glossary/>} />
          <Route path="/resources" element={<Resources/>} />
          {/* {routes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))} */}        
          <Route path="*" element={<Error404/>} />
          
        </Routes>
        </ThemeProvider>
      )}
    </Authenticator>
  );
}

export default App;