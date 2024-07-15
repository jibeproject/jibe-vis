import { FC, useState } from 'react';
import './navbar.css';
import logo from './cropped_jibe_logo_rgb.png';
import { Heading} from '@aws-amplify/ui-react';
import { AppBar, Container, Tabs, Tab } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar: FC<any> = () => {
  const [tab, setTab] = useState('/');
  const handleChange = (_e:any, newTab:string) => {
    setTab(newTab);
  };
  return (
    <div>
    <AppBar position="static" id="navbar">
      <Container>
        <div className="logos">
        <img src={logo} alt="Visualising impacts of urban and transport planning scenarios based on simulation modelling evidence from the JIBE Project" className="logo"/>
        <Heading id="navText" level={3} order={1}>Transport & Health Impacts</Heading>
        </div>
        </Container>
      <Tabs
        id="navtabs"
        value={tab}
        onChange={handleChange}
        aria-label="Navigation"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="About" component={Link} value="/" to={"/"} />
        <Tab label="Cycling traffic stress example" component={Link} value="map" to={"map/"} />
        <Tab label="Glossary" component={Link} value="glossary" to={"glossary/"} />
        <Tab label="Resources" component={Link} value="resources" to={"resources/"} />
      </Tabs>
    </AppBar>
    <div className="navFiller" /> 
    </div>
  );
};
export default Navbar;