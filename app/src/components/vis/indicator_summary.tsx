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


 export function BasicTable(featureID:string, indicator_values: { [key: string]: any }, scenario_settings: { [key: string]: any }) {
    const name = (scenario_settings.id.prefix||'')+' '+(featureID||(scenario_settings.id.unnamed||''));
    const variableSelect = document.getElementById('variable-select') as HTMLSelectElement;
    let focus_value = indicator_values[scenario_settings.dictionary[variableSelect?.value || scenario_settings.focus.variable]];
    // console.log(focus_value);
    let updatedIndicatorValues = indicator_values;
    if ('transformations' in scenario_settings) {
      Object.keys(scenario_settings.transformations).forEach((t: any) => {
        updatedIndicatorValues = transformation(t, scenario_settings.transformations[t], updatedIndicatorValues);
      });
    }
    return `
    <div id="lts" style="background-color: ${getFocusColour(focus_value, scenario_settings.focus.range)}">
      <h3>${name}</h3>
    </div>
    <table id="indicator_summary">
      <thead>
      <tr>
      <th>Description</th>
      <th>Value</th>
      </tr>
      </thead>
      <tbody>
      ${Object.entries(updatedIndicatorValues)
      .filter(([key]) => key !== scenario_settings.id.variable)
      .map(([key, value]: [string, any]) => `
      <tr>
      <td>${key}</td>
      <td>${typeof value === 'number' ? value.toFixed(1) : value}</td>
      </tr>
      `)
      .join('')}
      </tbody>
      </table>
    `;
  }


