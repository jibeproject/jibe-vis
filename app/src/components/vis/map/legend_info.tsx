import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import getFocusColour from '../colours';
import parse from 'html-react-parser';
import QuestionMark from '@mui/icons-material/QuestionMark';
import './legend_info.css';

interface LegendInfoProps {
    scenario: any;
}

function format_legend(scenario_settings: any, selectedLegendIndex: number | null, setSelectedLegendIndex: React.Dispatch<React.SetStateAction<number | null>>): React.ReactNode {
    const legend = scenario_settings.legend;
    const polarity = scenario_settings.colour_scale_direction || 'positive';
    const n = legend.length;
    return (
        <div id='legend'>
            <div id='legend-row' className='unfiltered'>
                { Object.entries(legend).map((item, index) => {
                    const colour = getFocusColour(index+1, [1, n], polarity);
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
                                } else {
                                    legendRow.className = `filtered-${index}-${content.range_greq_le.join('-')}`;
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
        <div id="indicator-content">
            {format_legend(scenario_layer, selectedLegendIndex, setSelectedLegendIndex)}  
            {variableSelect(scenario_layer)}
            <pre id="map-features">
                {params.scenario.mapFeatures || ''}
            </pre>
            {params.scenario.mapFeatures && params.scenario.mapFeatures.trim() !== '' && ( 
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

const variableFilter = (scenario_layer: any, handleFilterChange: (key: string, value: string) => void, filterState: { [key: string]: string }) => {
    if (!scenario_layer.variable_filter) return null;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            {Object.keys(scenario_layer.variable_filter).map(key => (
                <Box key={key} sx={{ minWidth: 40 }}>
                    <FormControl>
                        <InputLabel id={`variable-filter-${key}-label`}>{key}</InputLabel>
                        <Select
                            labelId={`variable-filter-${key}-label`}
                            value={filterState[key]}
                            label={filterState[key]}
                            onChange={(e) => handleFilterChange(key, e.target.value)}
                        >
                            {Object.keys(scenario_layer.variable_filter[key]).map(k => (
                                <MenuItem key={k} value={k}>{k}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            ))}
        </Box>
    );
};

const getSelectedValues = (scenario_layer: any) => {
    const selectedValues: { [key: string]: string } = {};
    Object.keys(scenario_layer.variable_filter).forEach(key => {
        const selectElement = document.getElementById(`variable-filter-${key}`) as HTMLSelectElement;
        if (selectElement && selectElement.value) {
            selectedValues[key] = selectElement.value;
        }
    });
    return selectedValues;
};

const findCommonKeys = (scenario_layer: any, selectedValues: { [key: string]: string }) => {
    const selectedLists = Object.keys(selectedValues).map(key => scenario_layer.variable_filter[key][selectedValues[key]]);
    const nonEmptyLists = selectedLists.filter(list => list && list.length > 0);
    if (nonEmptyLists.length === 0) return Object.keys(scenario_layer.dictionary);

    return nonEmptyLists.reduce((commonKeys, list) => {
        return commonKeys.filter((key: string) => list.includes(key));
    }, Object.keys(scenario_layer.dictionary));
};

const variableSelect = (scenario_layer: any) => {
    const initialFilterState = Object.keys(scenario_layer.variable_filter).reduce((acc: { [key: string]: string }, key) => {
        acc[key] = Object.keys(scenario_layer.variable_filter[key])[0];
        return acc;
    }, {} as { [key: string]: string });

    const [filterState, setFilterState] = useState(initialFilterState);
    const [commonKeys, setCommonKeys] = useState(Object.keys(scenario_layer.dictionary));

    const handleFilterChange = (key: string, value: string) => {
        setFilterState(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    useEffect(() => {
        if (scenario_layer.variable_filter) {
            const selectedValues = getSelectedValues(scenario_layer);
            const commonKeys = findCommonKeys(scenario_layer, selectedValues);
            setCommonKeys(commonKeys);
        }
    }, [filterState, scenario_layer]);
    return (
        <div>
            <p>{scenario_layer.focus.selection_description}</p>
            {variableFilter(scenario_layer, handleFilterChange, filterState)}
            <select id="variable-select" defaultValue={scenario_layer.focus_variable}>
                {commonKeys.map(key => (
                    scenario_layer.dictionary[key] !== scenario_layer.dictionary[scenario_layer.index.variable] ? (
                        <option key={key} value={key}>{scenario_layer.dictionary[key]}</option>
                    ) : null
                ))}
            </select>
        </div>
    );
};
export default LegendInfo;