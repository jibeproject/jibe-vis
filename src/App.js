import React from 'react';
import logo from './logo.svg';
import Navbar from './components/navbar.js';
import Map from './components/map.js';
import './App.css';
import { Amplify } from 'aws-amplify';
import { withAuthenticator, Button} from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);
function App({ signOut }) {
  return (
      <div className="App">
      <Navbar/>
      <Button onClick={signOut} className='sign-out'>Sign out</Button>
      <Map/>
      <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
    </div>
  );
}
export default withAuthenticator(App);