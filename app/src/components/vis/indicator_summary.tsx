import getFocusColour from './colours';
import './indicator_summary.css';

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


 export function BasicTable(featureID:string, indicator_values: { [key: string]: any }, scenario_layer: { [key: string]: any }) {
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
    return `
    <div id="lts" style="background-color: ${getFocusColour(focus_value, scenario_layer.focus.range)}">
      <h3>${name}</h3>
    </div>
    <table id="indicator_summary">
      <thead>
      <tr>
      <th>Description</th>
      <th style="text-align: right;">${scenario_layer.focus.units}</th>
      </tr>
      </thead>
      <tbody>
      ${Object.entries(updatedIndicatorValues)
      .filter(([key]) => key !== scenario_layer.index.variable)
      .map(([key, value]: [string, any]) => `
      <tr>
      <td>${key}</td>
      <td style="text-align: right;">${typeof value === 'number' ? value.toFixed(1) : value}</td>
      </tr>
      `)
      .join('')}
      </tbody>
      </table>
    `;
  }


