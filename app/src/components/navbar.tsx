import { FC, useState } from 'react';
import './navbar.css';
import logo from './cropped_jibe_logo_rgb.png';
import { Tabs } from '@aws-amplify/ui-react';
import Map from './map';
// import Map2 from './map2';
import { About } from './about';

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
            label: 'Get the data',
            value: '3',
            content: (
              <>
              List of data and options for download
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export default Navbar;