import { Button } from '@mui/material';
import getFocusColour from './colours';
import './indicator_summary.css';
import { FC } from 'react';

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
  const name = (scenario_layer.index.prefix||'')+' '+(featureID||(scenario_layer.index.unnamed||''));
    const variableSelect = document.getElementById('variable-select') as HTMLSelectElement;
    let focus_value = indicator_values[scenario_layer.dictionary[variableSelect?.value || scenario_layer.focus.variable]];
    // console.log(focus_value);
    let updatedIndicatorValues = indicator_values;
    if ('transformations' in scenario_layer) {
      Object.keys(scenario_layer.transformations).forEach((t: any) => {
        updatedIndicatorValues = transformation(t, scenario_layer.transformations[t], updatedIndicatorValues);
      });
    }
    
    return (
      <div>
    <div id="lts" style={{ backgroundColor: getFocusColour(focus_value, scenario_layer.focus.range) }}>
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
          <td key={key+'-value'} style={{ textAlign: 'right' }}>{typeof value === 'number' ? value.toFixed(1) : value}</td>
        </tr>
        )}
      </tbody>
      </table>
      </div>
      <Button
        id="clear-indicators-button"
        onClick={() => {
          const mapFeaturesElement = document.getElementById('map-features');
          if (mapFeaturesElement) {
            mapFeaturesElement.textContent = '';
          }
        } }
      >
        Close
      </Button>
      </div>
    );
}

// interface IndicatorSummaryProps {
//     scenarioLayer: {
//         focus: { units: string };
//         index: { variable: string };
//     };
//     updatedIndicatorValues: { [key: string]: number | string };
// }

// const IndicatorSummary: React.FC<IndicatorSummaryProps> = ({ scenarioLayer, updatedIndicatorValues }) => {
//   useEffect(() => {
//     const container = document.getElementById('indicator_summary_container');
//     const progressBar = document.getElementById('scroll_progress_bar');
//     console.log(container);
//     const updateProgressBar = () => {
//       if (container && progressBar) {
//           const scrollTop = container.scrollTop;
//           const scrollHeight = container.scrollHeight - container.clientHeight;
//           const scrollPercentage = (scrollTop / scrollHeight) * 100;
//           progressBar.style.width = `${scrollPercentage}%`;
//       }
//     };

//     if (container) {
//         console.log('Adding scroll event listener');
//         container.addEventListener('scroll', updateProgressBar);
//     }

//     // Cleanup event listener on component unmount
//     return () => {
//         if (container) {
//             console.log('Removing scroll event listener');
//             container.removeEventListener('scroll', updateProgressBar);
//         }
//     };
// }, []);

//     return (
//         <div>
//             <div id="scroll_progress_bar"></div>
//             <div id="indicator_summary_container">
//                 <table id="indicator_summary">
//                     <thead>
//                         <tr>
//                             <th>Description</th>
//                             <th style={{ textAlign: 'right' }}>{scenarioLayer.focus.units}</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {Object.entries(updatedIndicatorValues)
//                             .filter(([key]) => key !== scenarioLayer.index.variable)
//                             .map(([key, value]) => (
//                                 <tr key={key}>
//                                     <td>{key}</td>
//                                     <td style={{ textAlign: 'right' }}>{typeof value === 'number' ? value.toFixed(1) : value}</td>
//                                 </tr>
//                             ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// const scenarioLayer = {
//     focus: { units: 'units' },
//     index: { variable: 'indexVariable' }
// };

// const updatedIndicatorValues = {
//     key1: 10,
//     key2: 20,
//     indexVariable: 30
// };

// const container = document.getElementById('root');
// if (container) {
//     const root = getRoot(container);
//     root.render(
//         <IndicatorSummary scenarioLayer={scenarioLayer} updatedIndicatorValues={updatedIndicatorValues} />
//     );
// }

// export default IndicatorSummary;


