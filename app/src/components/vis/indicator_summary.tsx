import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ExpandCircleDownTwoTone from '@mui/icons-material/ExpandCircleDownTwoTone';
import {getFocusColour} from './colours';
import './indicator_summary.css';
import { FC, useState } from 'react';

function transformation(t:string, transformation:any, indicator_values: { [key: string]: any }) {
  let updatedIndicatorValues: { [key: string]: any } = {};
    for (const key in indicator_values) {
      let updatedKey = key;
      if (key.includes(t)) {
        if (transformation.replace_key) {
          updatedKey = key.replace(t, transformation.replace_key);
          updatedIndicatorValues[updatedKey] = indicator_values[key];
        }
        if (transformation.multiply_value) {  
          const updatedValue = indicator_values[key] * transformation.multiply_value;
          updatedIndicatorValues[updatedKey] = updatedValue;
        }
        if (transformation.type && transformation.type === 'integer') {
          const updatedValue = Math.trunc(Math.round(indicator_values[key]));
          updatedIndicatorValues[updatedKey] = updatedValue;
        }
      } else {
        updatedIndicatorValues[updatedKey] = indicator_values[key];
      }
    }

  return updatedIndicatorValues;
}

interface BasicTableProps {
  featureID: string;
  indicator_values: { [key: string]: any };
  scenario_layer: any;
}

export const BasicTable: FC<BasicTableProps> = ({ featureID, indicator_values, scenario_layer }: BasicTableProps) => {
  
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
      const indicatorSummaryContainer = document.getElementById('indicator_summary_container');
      if (indicatorSummaryContainer) {
          if (isMinimized) {
              indicatorSummaryContainer.style.display = 'block';
          } else {
              indicatorSummaryContainer.style.display = 'none';
          }
          setIsMinimized(!isMinimized);
      }
  };

  const name = (scenario_layer.index.prefix||'')+' '+(featureID||(scenario_layer.index.unnamed||''));
    const variableSelect = document.getElementById('variable-select') as HTMLSelectElement;
    if (!variableSelect) {
      return <div></div>;
    }
    let focus_value = indicator_values[scenario_layer.dictionary[variableSelect?.value || scenario_layer.focus?.variable]];
    // console.log(focus_value);
    let colour;
    if (typeof focus_value === 'number') {
      colour = getFocusColour(focus_value, scenario_layer.focus.range);
    } else if (typeof focus_value === 'string') {
        colour = scenario_layer.legend.find((item: any) => item.level === focus_value)?.colour;
    } else {
        colour = "transparent";
    }
    let updatedIndicatorValues = indicator_values;
    if ('transformations' in scenario_layer) {
      Object.keys(scenario_layer.transformations).forEach((t: any) => {
        updatedIndicatorValues = transformation(t, scenario_layer.transformations[t], updatedIndicatorValues);
      });
    }  
    return (
      <div>
    <div id="lts" style={{ backgroundColor: colour }}>
      <h3>{name}</h3>
    </div>
    <div id="indicator_summary_container">
    <table id="indicator_summary">
      <thead>
        <tr>
          <th>Description</th>
          <th style={{ textAlign: 'right' }}>{scenario_layer.focus.units}</th>
        </tr>
      </thead>
      <tbody>
      {Object.entries(updatedIndicatorValues)
        .filter(([key]) => key !== scenario_layer.index.variable)
        .map(([key, value]: [string, any]) => 
        <tr key={key}>
          <td key={key}>{key}</td>
          <td key={key+'-value'} style={{ textAlign: 'right' }}>
            {typeof value === 'number' ? (value % 1 === 0 ? value.toLocaleString() : value.toFixed(1).toLocaleString()) : value}
          </td>
        </tr>
        )}
      </tbody>
      </table>
      <div id="dictionary-notes-container" >
      {scenario_layer.dictionary_notes && (
        <Typography id="dictionary-notes" variant="caption" >
          {scenario_layer.dictionary_notes}
        </Typography>
      )}   
      </div>  
    </div>
    <Tooltip title={isMinimized ? 'Expand indicator summary' : 'Hide indicator summary'}>
      <Button
          id="minimise-indicators-button"
          onClick={handleToggle}

          style={{
              background: isMinimized ? 'none' : `linear-gradient(
                to top, 
                rgba(255, 255, 255, 1), 
                rgba(255, 255, 255, 1), 
                rgba(255, 255, 255, 0.75), 
                rgba(255, 255, 255, 0)
                )`,
          }}
      >
          <ExpandCircleDownTwoTone
            style={{
                marginTop: isMinimized ? '1.2em': '0em',
                bottom: isMinimized ? '0em': '-2.2em',
                transform: isMinimized ? 'none': 'scaleY(-1)',
                // transition: 'transform 0.3s ease',
            }}
          
          />
      </Button>
    </Tooltip>
      </div>
    );
}


