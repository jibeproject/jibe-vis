import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
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

        </div>
    </div>
);
};

const variableFilter = (scenario_layer: any, handleFilterChange: (key: string, value: string) => void, filterState: { [key: string]: string }) => {
    if (!scenario_layer.variable_filter) return null;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, margin: 1 }}>
            {Object.keys(scenario_layer.variable_filter).map(key => (
                <Box key={key} sx={{ minWidth: 40 }}>
                    <FormControl>
                        <InputLabel id={`variable-filter-${key}-label`}>{key}</InputLabel>
                        <Select
                            id={`variable-filter`}
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

const getSelectedValues = (filterState: any): { [key: string]: string } => {
    const selectedValues: { [key: string]: string } = {};
    Object.keys(filterState).forEach(key => {
        if (filterState[key]) {
            selectedValues[key] = filterState[key];
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

// const extractPrefix = (value: string) => {
//     const match = value.match(/^[^\(]+/);
//     return match ? match[0].trim() : '';
// };

// const findClosestMatch = (previousVariable: string, commonKeys: string[], dictionary: { [key: string]: string }) => {
//     const previousPrefix = extractPrefix(dictionary[previousVariable] || '');
//     let closestMatch = commonKeys[0] || '';

//     commonKeys.forEach(key => {
//         const currentPrefix = extractPrefix(dictionary[key]);
//         if (currentPrefix === previousPrefix) {
//             closestMatch = key;
//         }
//     });

//     return closestMatch;
// };

const variableSelect = (scenario_layer: any) => {
    if (!scenario_layer.focus.selection_description) return null;
    let initialFilterState: { [key: string]: string };
    if (scenario_layer.variable_filter) {
        initialFilterState = Object.keys(scenario_layer.variable_filter).reduce((acc: { [key: string]: string }, key) => {
            acc[key] = Object.keys(scenario_layer.variable_filter[key])[0];
            return acc;
        }, {} as { [key: string]: string });
    } else{
        initialFilterState = {};
    }

    const [filterState, setFilterState] = useState(initialFilterState);
    const [commonKeys, setCommonKeys] = useState(Object.keys(scenario_layer.dictionary));
    const [selectedVariable, _setSelectedVariable] = useState(scenario_layer.focus_variable);

    const handleFilterChange = (key: string, value: string) => {
        setFilterState(prevState => {
            const newState = {
                ...prevState,
                [key]: value
            };
        const currentVariable = (document.getElementById('variable-select') as HTMLSelectElement)?.value;
        console.log('currentVariable', currentVariable);
        console.log('selectedVariable', selectedVariable);
        if (currentVariable !== selectedVariable) {
            _setSelectedVariable(currentVariable);
        }
        console.log(selectedVariable);


            // const selectedValues = getSelectedValues(newState);
            // const newCommonKeys = findCommonKeys(scenario_layer, selectedValues);

            // // Update the selected variable to one having a matching label, or otherwise one that is available
            // if (!newCommonKeys.includes(selectedVariable)) {
            //     const closestMatch = findClosestMatch(selectedVariable, newCommonKeys, scenario_layer.dictionary);
            //     setSelectedVariable(closestMatch);
            //     console.log('newCommonKeys', newCommonKeys);
            //     console.log('selectedVariable', selectedVariable);
                
            // }

            return newState;
        });
    };

    useEffect(() => {
        if (!scenario_layer.variable_filter) {
            setCommonKeys(Object.keys(scenario_layer.dictionary));
        } else {
            const selectedValues = getSelectedValues(filterState);
            const commonKeys = findCommonKeys(scenario_layer, selectedValues);
            setCommonKeys(commonKeys);
            // Update the selected variable to one having a matching label, or otherwise one that is available
            // if (!commonKeys.includes(selectedVariable)) {
            //     const closestMatch = findClosestMatch(selectedVariable, commonKeys, scenario_layer.dictionary);
            //     setSelectedVariable(closestMatch);
            // }
        }
    }, [filterState, scenario_layer]);
    return (
        <div>
            <p>{scenario_layer.focus.selection_description}</p>
            {variableFilter(scenario_layer, handleFilterChange, filterState)}
            {commonKeys.length === 0 ? (
                <i>Selected scenario not included in this data</i>
            ) : (
                <select id="variable-select" value={selectedVariable || scenario_layer.focus_variable}>
                    {commonKeys.map(key => (
                        scenario_layer.dictionary[key] !== scenario_layer.dictionary[scenario_layer.index.variable] ? (
                            <option key={key} value={key}>{scenario_layer.dictionary[key]}</option>
                        ) : null
                    ))}
                </select>
            )}
        </div>
    );
};
export default LegendInfo;