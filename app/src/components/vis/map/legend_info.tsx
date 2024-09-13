import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import getFocusColour from '../colours';
import parse from 'html-react-parser';
import QuestionMark from '@mui/icons-material/QuestionMark';
import './legend_info.css';

interface LegendInfoProps {
  scenario_settings: any;
  story: any;
}

function format_legend(legend: any[]): React.ReactNode {
    // Reference legend to recreate
    // <div id='lts-legend'><div id='lts-legend-row'><div id='lts-1' title='lowest stress, for use by all cyclists'><p>1</p><p>low</p></div><div id='lts-2'>2</div><div id='lts-3'>3</div><div id='lts-4' title='most stressful, and least suitable for safe cycling'><p>4</p><p>high</p></div></div></div>
    const n = legend.length;
    return (
        <div id='legend'>
            <div id='legend-row'>
                { Object.entries(legend).map((item, index) => {
                    const colour = getFocusColour(index+1, [1, n]);
                    return (
                    <div key={index} id={`legend-cell`} title={item[1].title} style={{ backgroundColor: colour }}>
                        <p>{item[1].upper}</p>
                        <p>{item[1].lower}</p>
                    </div>
                    );
                })}
            </div>
        </div>
    );
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
    <div id="legend-container">
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
            {format_legend(params.scenario_settings.legend)}            
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