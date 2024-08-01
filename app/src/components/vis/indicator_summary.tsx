import './indicator_summary.css';

export const indicators: { [key: string]: any } = {
    "name": "Name",
    "length": "Length (m)",
    "cycleTime": "Estimated cycle time (secs)",
    "walkTime": "Estimated walking time (secs)",
    "carSpeedLimitMPH": "Car speed limit (MPH)",
    "width": "Width (m)",
    // "lanes": "Lanes (#)",
    "aadt": "Average annual daily traffic (vehicles)",
    "vgvi": "Viewshed Greenness Visibility Index (VGVI)",
    "bikeStressDiscrete": "Bike stress classification (UK)",
    "bikeStress": "Bike stress score (UK)",
    "walkStress": "Walk stress score (UK)",
    "LTS": "Level of traffic stress (Victoria)"
    };

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

const LTS_colour: { [key: string]: any } = {
  // Based on Batlow colour scheme https://www.fabiocrameri.ch/batlow/
  1:"#011959",
  2:"#3c6d56",
  3:"#d29343",
  4:"#faccfa",
}

export function BasicTable(indicator_values: { [key: string]: any }) {
    const name = indicator_values["Name"];
    const LTS = indicator_values[indicators["LTS"]];
    const updatedIndicatorValues = mph_to_km(indicator_values);
    return `
    <div id="lts" style="background-color: ${LTS_colour[LTS]}">
      <h3>${name || 'Unnamed route'}</h3>
    </div>
    <table id="indicator_summary">
      <thead>
      <tr>
      <th>Description</th>
      <th>Indicator</th>
      </tr>
      </thead>
      <tbody>
      ${Object.entries(updatedIndicatorValues)
      .filter(([key]) => key !== 'Name' && key !== indicators["LTS"])
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


export function KeyTerms() {
    return(
        <div>
            <h1>Test Things</h1>
            <p>Test things are things that are tested.</p>
            {BasicTable(indicators)}
        </div>
    );
}