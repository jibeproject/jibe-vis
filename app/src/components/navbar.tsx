import { FC, useState } from 'react';
import './navbar.css';
import logo from './cropped_jibe_logo_rgb.png';
import TransportHealthImpacts from './vis/transporthealthimpacts.tsx';
import { Tabs } from '@aws-amplify/ui-react';
import Map from './map';
import { About } from './about';
// import { Roadmap } from './roadmap';
import { Data } from './data';
import { JibeGlossary } from './glossary';

const Navbar: FC = () => {
  const [tab, setTab] = useState('1');
  window.addEventListener('load', function () {
    window.onscroll = function() {stickyNav()};
    var navbar = document.getElementsByClassName("amplify-tabs__list")[0] as HTMLElement;
    // console.log(navbar)
    var sticky = navbar.offsetTop;
    function stickyNav() {
      if (window.scrollY >= sticky) {
        navbar.classList.add("sticky")
      } else {
        navbar.classList.remove("sticky");
      }
    }
  })
  
  return (
    <>
      <div className="logos">
      <img src={logo} alt="Visualising impacts of urban and transport planning scenarios based on simulation modelling evidence from the JIBE Project" className="logo"/>
      <TransportHealthImpacts/>
      </div>
      <Tabs 
        className="heading"
        value={tab}
        onValueChange={(tab) => setTab(tab)}
        spacing="equal"
        items={[
          {label: 'Transport and health impacts', value: '1', content: (<><About /></>)},
          // {label: 'Project roadmap', value: '5', content: (<><Roadmap /></>)},
          {label: 'Cycling traffic stress example', value: '2', content: (<><Map /></>)},
          {label: 'Glossary', value: '3', content: (<><JibeGlossary/></>)},
          {label: 'Resources', value: '4', content: (<><Data /></>)},
        ]}
      />
    </>
  );
}

export default Navbar;