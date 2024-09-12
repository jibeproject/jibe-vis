import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import parse from 'html-react-parser';
import QuestionMark from '@mui/icons-material/QuestionMark';
import './legend_info.css';

interface LegendInfoProps {
  scenario_settings: any;
  story: any;
}

const LegendInfo: React.FC<LegendInfoProps> = (params) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const handleInfoClickOpen = () => {
    setInfoOpen(true);
  };

  const handleInfoClose = () => {
    setInfoOpen(false);
  };
  

return (
    <div id="legend">
        <h2 id="indicator-heading">{params.story?.title||''}
            <QuestionMark className="question" titleAccess="Find out more" onClick={handleInfoClickOpen} />
              </h2>
        <Dialog open={infoOpen} onClose={handleInfoClose}>
            <DialogTitle>{params.story?.title||''}</DialogTitle>
            <DialogContent>
                {parse(params.scenario_settings.help||'<p>Information has not yet been added for this scenario.</p>')}
                <div id="directions" title="How to use this map"> {params.scenario_settings.directions || 'This scenario has not yet been defined.'}</div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleInfoClose} color="primary">
                    Return to map
                </Button>
            </DialogActions>
        </Dialog>
        <div id="indicator-content">
            {parse(params.scenario_settings.legend||"<div id='lts-legend'/>")}            
            {params.scenario_settings.focus.selection_description && (
                <div>
                    <p>{params.scenario_settings.focus.selection_description}</p>
                    <select id="variable-select">
                        {Object.keys(params.scenario_settings.dictionary).map(key => (
                            <option key={key} value={key}>{params.scenario_settings.dictionary[key]}</option>
                        ))}
                    </select>
                </div>
            )}
            <pre id="map-features">
                {params.scenario_settings.mapFeatures || ''}
            </pre>
            {params.scenario_settings.mapFeatures && params.scenario_settings.mapFeatures.trim() !== '' && ( 
                <Button 
                    onClick={() => {
                        document.getElementById('map-features')!.textContent = '';
                    }} 
                    color="primary"
                >
                    Clear
                </Button>
            )}
        </div>
    </div>
);
};

export default LegendInfo;