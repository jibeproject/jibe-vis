import { FC } from 'react';
import Navbar from './components/navbar';
import './App.css';
import { Amplify } from 'aws-amplify';
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from '../amplify_outputs.json';

Amplify.configure(awsconfig);

interface AppProps {}

const theme = {
  name: 'jibe-theme',
  tokens: {
    colors: {
      font: {
        active: { value: "#2caa4a" },
        interactive: { value: "#2caa4a" },
        hover: { value: "#2caa4a" }
      },
    },
  },
};

const App: FC<AppProps> = () => {
  return (
    <Authenticator
      hideSignUp={true}
    >
          {({ signOut, user }) => (
            <ThemeProvider theme={theme}>
            <main>
              <button onClick={signOut} className='sign-out'>Sign out ({user?.signInDetails?.loginId})</button>
              <div className="App">
                <Navbar />
              </div>
            </main>
            </ThemeProvider>
          )}
        </Authenticator>
  );
}

export default App;