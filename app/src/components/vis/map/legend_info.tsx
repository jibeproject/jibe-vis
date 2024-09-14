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

function format_legend(scenario_settings: any, selectedLegendIndex: number | null, setSelectedLegendIndex: React.Dispatch<React.SetStateAction<number | null>>): React.ReactNode {
    const legend = scenario_settings.legend;
    const n = legend.length;
    return (
        <div id='legend'>
            <div id='legend-row' className='unfiltered'>
                { Object.entries(legend).map((item, index) => {
                    const colour = getFocusColour(index+1, [1, n]);
                    const content = item[1] as { title?: string; upper?: string; lower?: string; range_greq_le: number[] };
                    return (
                    <div 
                        key={index} 
                        id={`legend-cell-${index}`} 
                        title={
                            content.title || 
                            (content.upper||'') +' '+(content.lower||'')
                        } 
                        style={{ 
                            backgroundColor: colour, 
                            filter: selectedLegendIndex !== null && selectedLegendIndex !== index ? 'grayscale(100%)' : 'none',
                            opacity: selectedLegendIndex !== null && selectedLegendIndex !== index ? 0.4 : 1
                        }}
                        onClick={() => {
                            // Toggle the selection state
                            setSelectedLegendIndex(selectedLegendIndex === index ? null : index);
                            // Mark the legend-row as filtered using the range when a cell is selected
                            const legendRow = document.getElementById('legend-row');
                            if (legendRow) {
                                if (selectedLegendIndex === index) {
                                    legendRow.className = 'unfiltered';
                                } else {
                                    legendRow.className = 'filtered-'+content.range_greq_le.join('-');
                                }
                            }
                        }}
                    >
                        <p>{content.upper||''}</p>
                        <p>{content.lower||''}</p>
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

const [selectedLegendIndex, setSelectedLegendIndex] = useState<number | null>(null);

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
            {format_legend(params.scenario_settings, selectedLegendIndex, setSelectedLegendIndex)}            
            {params.scenario_settings.focus.selection_description && (
                <div>
                    <p>{params.scenario_settings.focus.selection_description}</p>
                    <select id="variable-select" defaultValue={params.scenario_settings.focus_variable}>
                        {Object.keys(params.scenario_settings.dictionary).map(key => (
                            params.scenario_settings.dictionary[key] !== params.scenario_settings.dictionary[params.scenario_settings.id.variable] ? (
                                <option key={key} value={key}>{params.scenario_settings.dictionary[key]}</option>
                            ) : null
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