import { FC, useState} from 'react';
import Navbar from './components/navbar';
import './App.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
// import { useEffect } from 'react';
// import { Hub } from 'aws-amplify/utils';
// import { useNavigate } from "react-router-dom";
import '@aws-amplify/ui-react/styles.css';
import awsconfig from '../amplify_outputs.json';
import Error404 from "./components/404-page";
import ErrorPage from "./components/error-page";
import { Intro } from './components/intro';
import { About } from './components/about/about.tsx';
import Map from './components/map';
import { Data } from './components/data';
import { JibeGlossary } from './components/glossary';
import { Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

Amplify.configure(awsconfig);

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <About />,
//     errorElement: <ErrorPage />,
//   },
//   {
//     path: "About/",
//     element: <About />,
//   },
//   {
//     path: "map/",
//     element: <Map />,
//   },
//   {
//     path: "glossary/",
//     element: <JibeGlossary />,
//   },
//   {
//     path: "resources/",
//     element: <Data />
//   }]
// );

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

const App: FC<AppProps> = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  // useEffect(() => {
  //   Hub.listen("auth", (data) => {
  //     if (data?.payload?.event?.includes("signIn")) {
  //       navigate("/protected");
  //     }
  //   });
  // }, []);
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
          <Route path="/map" element={<Map/>} />
          <Route path="/glossary" element={<JibeGlossary/>} />
          <Route path="/resources" element={<Data/>} />
          <Route path="*" element={<Error404 />} />
        </Routes>
        </ThemeProvider>
      )}
    </Authenticator>
  );
}

export default App;