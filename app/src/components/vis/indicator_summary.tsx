import './indicator_summary.css';

// export const indicators: { [key: string]: any } = {
//     "name": "Name",
//     "length": "Length (m)",
//     "cycleTime": "Estimated cycle time (secs)",
//     "walkTime": "Estimated walking time (secs)",
//     "carSpeedLimitMPH": "Car speed limit (MPH)",
//     "width": "Width (m)",
//     // "lanes": "Lanes (#)",
//     "aadt": "Average annual daily traffic (vehicles)",
//     "vgvi": "Viewshed Greenness Visibility Index (VGVI)",
//     "bikeStressDiscrete": "Bike stress classification (UK)",
//     "bikeStress": "Bike stress score (UK)",
//     "walkStress": "Walk stress score (UK)",
//     "LTS": "Level of traffic stress (Victoria)"
//     };

function mph_to_km(indicator_values: { [key: string]: any }) {
  const updatedIndicatorValues: { [key: string]: any } = {};

  for (const key in indicator_values) {
    if (key.includes("(MPH)")) {
      const updatedKey = key.replace("(MPH)", "(km/h)");
      const updatedValue = indicator_values[key] * 1.609;
      updatedIndicatorValues[updatedKey] = updatedValue;
    } else {
      updatedIndicatorValues[key] = indicator_values[key];
    }
  }

  return updatedIndicatorValues;
}

function getFocusColour(value: number,range: [number, number]): string {
  const [min, max] = range;
  const normalizedValue = (value - min) / (max - min);
  
  if (normalizedValue <= 0.25) {
    return "#011959"; // Color for the lowest range
  } else if (normalizedValue <= 0.5) {
    return "#3c6d56"; // Color for the lower-middle range
  } else if (normalizedValue <= 0.75) {
    return "#d29343"; // Color for the upper-middle range
  } else {
    return "#faccfa"; // Color for the highest range
  }
}

export function BasicTable(indicator_values: { [key: string]: any }, scenario_settings: { [key: string]: any }) {
    const name = indicator_values[scenario_settings.id.variable];
    const focus_value = indicator_values[scenario_settings.dictionary[scenario_settings.focus.variable]];
    const updatedIndicatorValues = mph_to_km(indicator_values);
    return `
    <div id="lts" style="background-color: ${getFocusColour(focus_value, scenario_settings.focus.range)}">
      <h3>${scenario_settings.id.prefix+' '+name || scenario_settings.id.unnamed || ''}</h3>
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
      .filter(([key]) => key !== 'Name' && key !== scenario_settings.dictionary[scenario_settings.focus.variable])
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


