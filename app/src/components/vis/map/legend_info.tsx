import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
// import Box from '@mui/material/Box';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import Select from '@mui/material/Select';
import { getFocusColour } from '../colours';
import parse from 'html-react-parser';
import QuestionMark from '@mui/icons-material/QuestionMark';
import './legend_info.css';

interface LegendInfoProps {
    scenario: any;
}

function format_legend(scenario_settings: any, selectedLegendIndex: number | null, setSelectedLegendIndex: React.Dispatch<React.SetStateAction<number | null>>): React.ReactNode {
    if (!scenario_settings) return <div/>;
    const legend = scenario_settings.legend;
    const polarity = scenario_settings.colour_scale_direction || 'positive';
    const n = legend.length;
    let colour;
    return (
        <div id='legend'>
            <div id='legend-row' className='unfiltered'>
                { Object.entries(legend).map((item, index) => {
                    if ('range_greq_le' in (item[1] as { range_greq_le?: number[] })) {
                        colour = getFocusColour(index+1, [1, n], polarity);
                    } else if ('colour' in (item[1] as { colour?: string })) {
                        colour = (item[1] as { colour?: string }).colour;
                    } else {
                        colour = "transparent";
                    }
                    const content = item[1] as { title?: string; upper?: string; lower?: string; range_greq_le: number[] };
                    if ('level' in content) {
                        content['upper'] = (content as { level: string }).level;
                    }
                    return (
                    <div 
                        key={index} 
                        id={`legend-cell-${index}`} 
                        title={
                            content.title || 
                            (content.upper||'') +' '+(content.lower||'')
                        } 
                        style={{ 
                            backgroundColor: selectedLegendIndex !== null && selectedLegendIndex !== index ? '#CCC' : colour,
                            borderColor: selectedLegendIndex !== null && selectedLegendIndex !== index ? 'white' : 'transparent',
                            borderLeftStyle: selectedLegendIndex !== null && selectedLegendIndex !== index ? 'solid' : 'none',
                            borderRightStyle: selectedLegendIndex !== null && selectedLegendIndex !== index ? 'solid' : 'none',
                            borderWidth: selectedLegendIndex !== null && selectedLegendIndex !== index ? 'thin' : 'none',
                            // opacity: selectedLegendIndex !== null && selectedLegendIndex !== index ? 0.4 : 1
                        }}
                        onClick={() => {
                            // Toggle the selection state
                            setSelectedLegendIndex(selectedLegendIndex === index ? null : index);
                            // Mark the legend-row as filtered using the range when a cell is selected
                            const legendRow = document.getElementById('legend-row');
                            if (legendRow) {
                                if (selectedLegendIndex === index) {
                                    legendRow.className = 'unfiltered';
                                } else if ('range_greq_le' in content) {
                                    legendRow.className = `filtered-${index}-${content.range_greq_le.join('-')}`;
                                } else if ('level' in (content as { level?: string })) {
                                    legendRow.className = `filtered-${index}-${(content as { level?: string }).level}`;
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
  const [infoOpen, setInfoOpen] = useState(true);
  const handleInfoClickOpen = () => {
    setInfoOpen(true);
  };

  const handleInfoClose = () => {
    setInfoOpen(false);
  };
const [selectedLegendIndex, setSelectedLegendIndex] = useState<number | null>(null);
const scenario_layer = params.scenario.layers[params.scenario.legend_layer]
return (
    <div id="legend-container">
        <h2 id="indicator-heading">{params.scenario?.title||''}
            <QuestionMark className="question" titleAccess="Find out more" onClick={handleInfoClickOpen} />
              </h2>
        <Dialog open={infoOpen} onClose={handleInfoClose}>
            <DialogTitle>{params.scenario?.title||''}</DialogTitle>
            <DialogContent>
                {parse(params.scenario.help||'<p>Information has not yet been added for this scenario.</p>')}
                <div id="directions" title="How to use this map"> {params.scenario.directions || 'This scenario has not yet been defined.'}</div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleInfoClose} color="primary">
                    Go to map
                </Button>
            </DialogActions>
        </Dialog>
        {scenario_layer && scenario_layer.legend && (
            <div id="indicator-content">
            {!scenario_layer.focus.selection_description && scenario_layer.focus.variable && <h3>{scenario_layer.dictionary[scenario_layer.focus.variable]}</h3>}
            {format_legend(scenario_layer, selectedLegendIndex, setSelectedLegendIndex)}
            {variableSelect(scenario_layer)}
            <pre id="map-features">
                {params.scenario.mapFeatures || ''}
            </pre>
            {LayerSelect({ scenario: params.scenario, setSelectedLayerIndex: () => {} })}
            </div>
        )}
    </div>
);
};


const variableSelect = (scenario_layer: any) => {
    if (!scenario_layer || !scenario_layer.focus || !scenario_layer.focus.selection_description) return null;
   const [selectedVariable, _setSelectedVariable] = useState(scenario_layer.focus_variable);

    const commonKeys = Object.keys(scenario_layer.dictionary);

    return (
        <div>
            <p>{scenario_layer.focus.selection_description}</p>
                <select id="variable-select" value={selectedVariable || scenario_layer.focus_variable}>
                {scenario_layer.focus && scenario_layer.focus.selection_list ? 
                    scenario_layer.focus.selection_list.map((key: string) => (
                        scenario_layer.dictionary[key] !== scenario_layer.dictionary[scenario_layer.index.variable] ? (
                            <option key={key} value={key}>{scenario_layer.dictionary[key]}</option>
                        ) : null
                    )) : 
                    commonKeys.map(key => (
                        scenario_layer.dictionary[key] !== scenario_layer.dictionary[scenario_layer.index.variable] ? (
                            <option key={key} value={key}>{scenario_layer.dictionary[key]}</option>
                        ) : null
                    ))
                }
                </select>
            {/* )} */}
        </div>
    );
};

const LayerSelect = ({ scenario, setSelectedLayerIndex }: { scenario: any, setSelectedLayerIndex: React.Dispatch<React.SetStateAction<number>> }) => {
    const select_layers = scenario.layers.filter((layer: any) => layer['layer-select'] === true);
    // console.log(scenario);
    // console.log(select_layers);
    if (!select_layers ) return null;
    
    const handleLayerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLayerIndex(Number(event.target.value));
    };

    return (
        <div>
            {scenario.linkage? "Summary layer: ":'Overlay: '}
            <select id="layer-select" onChange={handleLayerChange}>
                  {!scenario.linkage && (
                    <option key="none" value="none">Off</option>
                )}
                {select_layers.map((layer: any, index: number) => (
                    <option key={index} value={layer.id}>{layer.index.prefix}</option>
                ))}
            </select>
        </div>
    );
};

export default LegendInfo;