import React from 'react';
import './navbar.css';
import logo from './cropped-jibe_logo_rgb.png';

export default function Navbar(){
  return (
    <div className="heading">
        <img src={logo} alt="JIBE-Vis" className="logo"/>
    <h1>Visualising impacts of urban and transport planning scenarios based on simulation modelling evidence from the JIBE Project</h1>
    </div>
  );
}