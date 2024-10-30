import { FC, useEffect} from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from '../amplify_outputs.json';
import { Routes, Route, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Map from './components/vis/map/map';
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import Error404 from "./components/404-page";
import ErrorPage from "./components/error-page";
import { Intro } from './components/intro';
import { About } from './components/about/about.tsx';
import { Pathways } from './components/pathways';
import { Resources } from './components/resources';
import { Glossary } from './components/glossary';
import FeedbackChat from './components/feedback_chat';
import ShareURL from './components/share';
import Navbar from './components/navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

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

  useScrollToAnchor();
  return (
        <ThemeProvider theme={theme}>
        <main>
          <div className="App">
          <Navbar/>
          <ShareURL/>
          <FeedbackChat/>
          </div>
        </main>
        <Routes>
          <Route  path="/" element={<Intro/>} errorElement={<ErrorPage/>}/>
          <Route  path="/about" element={<About/>} />
          <Route path="/pathways" element={<Pathways/>} />
        <Route path="/map" element={
          <Authenticator hideSignUp={true}>
            {({ signOut, user }) => (
              signOut ? <ProtectedRoute element={<Map />} user={user} signOut={signOut} /> : <></>
            )}
          </Authenticator>
        } />
          <Route path="/glossary" element={<Glossary/>} />
          <Route path="/resources" element={<Resources/>} />
          {/* {routes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))} */}        
          <Route path="*" element={<Error404/>} />
          
        </Routes>
        </ThemeProvider>
  );
}

export default App;