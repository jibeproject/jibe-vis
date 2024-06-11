import { FC, useState } from 'react';
import './navbar.css';
import logo from './cropped_jibe_logo_rgb.png';
import { Tabs } from '@aws-amplify/ui-react';
import Map from './map';
import { About } from './about';
import { Data } from './data';
import { TestThings } from './indicator_summary';

const Navbar: FC = () => {
  const [tab, setTab] = useState('1');
  return (
    <>
      <img src={logo} alt="Visualising impacts of urban and transport planning scenarios based on simulation modelling evidence from the JIBE Project" className="logo"/>
      <Tabs 
        className="heading"
        value={tab}
        onValueChange={(tab) => setTab(tab)}
        spacing="equal"
        items={[
          {
            label: 'About',
            value: '1',
            content: (
              <>
                <About />
              </>
            ),
          },
          {
            label: '20-minute neighbourhoods',
            value: '2',
            content: (
              <>
                <Map />
              </>
            ),
          },
          {
            label: 'test_things',
            value: '3',
            content: (
              <>
              <TestThings />
              </>
            ),
          },
          {
            label: 'Resources',
            value: '4',
            content: (
              <>
              <Data />
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export default Navbar;