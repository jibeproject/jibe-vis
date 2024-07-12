import { FC, useEffect} from 'react';
import Navbar from './components/navbar';
import './App.css';
import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import { Authenticator } from '@aws-amplify/ui-react';
import { useNavigate } from "react-router-dom";
import '@aws-amplify/ui-react/styles.css';
import awsconfig from '../amplify_outputs.json';
import { About } from './components/about/about.tsx';
import Map from './components/map';
import { Data } from './components/data';
import { JibeGlossary } from './components/glossary';
import { Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

Amplify.configure(awsconfig);


interface AppProps {}
// const theme = {
//   name: 'jibe-theme',
//   tokens: {
//     colors: {
//       font: {
//         active: { value: "#2caa4a" },
//         interactive: { value: "#2caa4a" },
//         hover: { value: "#2caa4a" }
//       },
//     },
//   },
// };

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
  const navigate = useNavigate();

  useEffect(() => {
    Hub.listen("auth", (data) => {
      if (data?.payload?.event?.includes("signIn")) {
        navigate("/protected");
      }
    });
  }, []);
  return (
    <Authenticator
      hideSignUp={true}
    >
      {({ signOut, user }) => (
        <ThemeProvider theme={theme}>
        <main>
          <div className="App">
                <button onClick={signOut} className='sign-out'>Sign out ({user?.signInDetails?.loginId})</button>
              <Navbar/>
          </div>
        </main>
        <Routes>
          <Route  path="/" element={<About/>} />
          <Route path="/map" element={<Map/>} />
          <Route path="/glossary" element={<JibeGlossary/>} />
          <Route path="/resources" element={<Data/>} />
        </Routes>
        </ThemeProvider>
      )}
    </Authenticator>
  );
}

export default App;