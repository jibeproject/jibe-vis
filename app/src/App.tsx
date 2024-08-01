import { FC, useEffect, useState} from 'react';
import Navbar from './components/navbar';
import './App.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { useLocation } from "react-router-dom";
import '@aws-amplify/ui-react/styles.css';
import awsconfig from '../amplify_outputs.json';
import Error404 from "./components/404-page";
import ErrorPage from "./components/error-page";
import { Intro } from './components/intro';
import { About } from './components/about/about.tsx';
import { Pathways } from './components/pathways';
import { Resources } from './components/resources';
import { Glossary } from './components/glossary';
import { Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

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
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (hash === '') window.scrollTo(0, 0)
    else {
      setTimeout(() => {
        const id = hash.replace('#', '')
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
  }, [pathname, hash, key])
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
        </main>
        <Routes>
          <Route  path="/" element={<Intro/>} errorElement={<ErrorPage/>}/>
          <Route  path="/about" element={<About/>} />
          <Route path="/pathways" element={<Pathways/>} />
          <Route path="/glossary" element={<Glossary/>} />
          <Route path="/resources" element={<Resources/>} />
          <Route path="*" element={<Error404 />} />
        </Routes>
        </ThemeProvider>
      )}
    </Authenticator>
  );
}

export default App;