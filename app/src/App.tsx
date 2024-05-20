import { FC } from 'react';
import Navbar from './components/navbar';
import './App.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from '../amplify_outputs.json';

Amplify.configure(awsconfig);

interface AppProps {}

const App: FC<AppProps> = () => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <button onClick={signOut} className='sign-out'>Sign out ({user?.signInDetails?.loginId})</button>
          <div className="App">
            <Navbar />
          </div>
        </main>
      )}
    </Authenticator>
  );
}

export default App;