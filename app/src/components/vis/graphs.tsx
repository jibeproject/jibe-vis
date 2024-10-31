import { BarChart, Bar, CartesianGrid, Label, Legend, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import html2canvas from 'html2canvas';
import { Download } from '@mui/icons-material'
import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Dialog, Typography, DialogContent, DialogActions, Button } from '@mui/material';

interface ScenarioLayer {
  popup: string;
  focus: any;
  target_threshold: any;
  source: any;
  dictionary: {
    [key: string]: string;
  };
  index: {
    variable: string;
    unnamed?: string;
  };
  legend: {
    label: string;
    range_greq_le: number[];
  }[];
  'linkage-code'?: string;
}


interface DownloadChartAsPngProps {
  elementId: string;
}

export const DownloadChartAsPng: React.FC<DownloadChartAsPngProps> = ({ elementId }) => {
  const handleClick = () => {
    const chartElement = document.getElementById(elementId);
    if (chartElement) {
      html2canvas(chartElement).then(canvas => {
        const link = document.createElement('a');
        link.download = 'chart.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    } else {
      console.error(`Element with ID ${elementId} not found.`);
    }
  };

  return (
    <Button onClick={handleClick} color="primary" startIcon={<Download />}>
      Download
    </Button>
  );
};


export const GraphPopup = ({ feature, scenario_layer, scenario, open, onClose }: { feature: maplibregl.MapGeoJSONFeature, scenario_layer: ScenarioLayer, scenario: any, open: boolean, onClose: () => void }) => {
  if (scenario_layer.popup==='graph') {
    const { properties } = feature;
    // Prepare data for the bar chart
    const data = Object.entries(properties)
      .filter(([key]) => scenario_layer.dictionary.hasOwnProperty(key) && key !== scenario_layer.index.variable)
      .map(([key, value]) => ({ name: scenario_layer.dictionary[key], value: Number(value).toFixed(1) }));
    // Calculate the maximum observed value
    const maxLegendValue = Math.max(...scenario_layer.legend.flatMap(entry => entry.range_greq_le));
    // Check if "Target threshold" exists in scenario_layer.legend
    const targetThresholdEntry = scenario_layer.legend.find(entry => entry.label === "Target threshold");
    const targetThresholdValue = targetThresholdEntry ? targetThresholdEntry.range_greq_le[0] : null;
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <div id="modal-popup-container">
            <Typography variant="h6">{scenario_layer.focus?.selection_description}</Typography>
            <div style={{ width: '100%', height: '100%' }}>
              <Typography variant="h5">{feature.properties.name}</Typography>
              <ResponsiveContainer width="95%" height={400} minWidth={400}>
                <BarChart data={data} layout="vertical" margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, maxLegendValue]} />
                  {targetThresholdValue !== null && (
                    <ReferenceLine 
                      x={targetThresholdValue} 
                      stroke="black" 
                      label={{ position: 'top', value: `Target (${targetThresholdValue} ${scenario_layer.focus.units})`, fill: 'black', fontSize: 12 }}
                    />
                  )}
                  <YAxis type="category" width={300} dataKey="name" interval={0} textAnchor="end" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <DownloadChartAsPng elementId="modal-popup-container" />
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  } 
  const [data, setData] = useState<any[]>([]);
  const [showFullData, setShowFullData] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [targetThreshold, setTargetThreshold] = useState(null);
  const [loading, setLoading] = useState(true);

  const area = scenario_layer['linkage-code'] ? scenario_layer['linkage-code'] : scenario_layer.index.variable;
  const code = feature.properties[area];
  const areaCodeColumn = `${area.toLowerCase()}.home`;
  const variable = "mmethr";
  const group = "gender";
  const city = scenario.city;
  const red = "#fc4e57";
  const purple = "#a3488b";
  const blue = "#3196bc";
  const title = "Metabolic equivalent (MET) physical activity (hours/week)";

  useEffect(() => {
    const fetchData = async () => {
      const data = await queryJibeParquet(area, code, variable, group, city);
      setData(data);
      setFilteredData(filterData(data, code));
      if (scenario_layer.target_threshold && scenario_layer.target_threshold[variable]) {
        setTargetThreshold(scenario_layer.target_threshold[variable]);
      }
      setLoading(false);
    };

    fetchData();
  }, [area, code, variable, group, city, scenario_layer]);

  const filterData = (data: any[], code: string) => {
    return data.filter(entry => entry[areaCodeColumn] === code || entry[areaCodeColumn] === city + ' (Overall)');
  };

  const handleToggleData = () => {
    setShowFullData(prevState => !prevState);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <div id="modal-popup-container">
          {loading ? (
            <div id="modal-popup-content">
              <CircularProgress />
            </div>
          ) : (
    <div style={{ width: '100%', height: '100%' }}>
      <Typography variant="h5">{title}</Typography>
      <Button onClick={handleToggleData}>
        {showFullData ? 'Show Filtered Data' : 'Show Full Data'}
      </Button>
      <ResponsiveContainer width="95%" height={400} minWidth={400}>
        <BarChart
        width={800}
        height={300}
        data={showFullData ? data : filteredData}
        layout="vertical"
        barCategoryGap={1}
        margin={{
          top: 5,
          right: 0,
          left: 40,
          bottom: 5,
        }}
      >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" >
            <Label value="Marginal MET Hours per Week" offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis type="category" dataKey={areaCodeColumn}/>
          <Tooltip content={CustomTooltip} />
          {/* <Tooltip /> */}
          <Legend
            wrapperStyle={{bottom: -15, left: 0}}
            payload={[
              { value: "Walking", id: "mmethr_walk", color: red },
              { value: "Cycling", id: "mmethr_cycle", color: purple },
              { value: "Other sport", id: "mmethr_othersport", color: blue }
            ]}
          />
          <Bar dataKey="Female.mmethr_walk" stackId="a" fill={red} label={"Female"} onClick={() => copyTableToTSV()} />
          <Bar dataKey="Female.mmethr_cycle" stackId="a" fill={purple} label={"Female"} onClick={() => copyTableToTSV()} />
          <Bar dataKey="Female.mmethr_othersport" stackId="a" fill={blue} label={"Female"} onClick={() => copyTableToTSV()} />
          <Bar dataKey="Male.mmethr_walk" stackId="b" fill={red} label={"Male"} onClick={() => copyTableToTSV()} />
          <Bar dataKey="Male.mmethr_cycle" stackId="b" fill={purple} label={"Male"}  onClick={() => copyTableToTSV()} />
          <Bar dataKey="Male.mmethr_othersport" stackId="b" fill={blue} label={"Male"}  onClick={() => copyTableToTSV()} />
          {targetThreshold !== null && (
            <ReferenceLine 
                x={targetThreshold} 
                stroke="black" 
                label={{ position: 'bottom', value: `Target*`, fill: 'black', fontSize: 12 }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <DownloadChartAsPng elementId="modal-popup-container" />
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CustomTooltip = ({
  active,
  payload
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload) {
    // console.log(payload);
    const index = payload[0].payload;
    const area = String(Object.values(index)[0]);
    return (
      <div
        key={index.date}
        style={{
          padding: "6px",
          backgroundColor: "white",
          border: "1px solid grey"
        }}
      >
        <b>{area}</b>
        <table id={area} className='popup_summary' >
          <thead>
            <tr>
              <th scope='col'></th>
              <th scope='col'>Walk</th>
              <th scope='col'>Cycle</th>
              <th scope='col'>Other sport</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td ><b>Female</b></td>
              <td >{index.Female.mmethr_walk}</td>
              <td >{index.Female.mmethr_cycle}</td>
              <td >{index.Female.mmethr_othersport}</td>
            </tr>
            <tr>
              <td ><b>Male</b></td>
              <td >{index.Male.mmethr_walk}</td>
              <td >{index.Male.mmethr_cycle}</td>
              <td >{index.Male.mmethr_othersport}</td>
            </tr>
          </tbody>
        </table>
        <i>Click to copy table to clipboard</i>
      </div>
    );
  }
  return null;
};

const copyTableToTSV = () => {
  const table = document.getElementsByClassName('popup_summary')[0];
  if (!table) return;
  const area = table.getAttribute('id');
  let tsv = `${area}\n`;
  const rows = table.querySelectorAll('tr');

  rows.forEach(row => {
    const cols = row.querySelectorAll('th, td');
    const rowData = Array.from(cols).map(col => col.textContent?.trim()).join('\t');
    tsv += rowData + '\n';
  });

  navigator.clipboard.writeText(tsv).then(() => {
    console.log(`Table for ${area} copied to clipboard in TSV format`);
  }).catch(err => {
    console.error('Failed to copy table to clipboard: ', err);
  });
};


const queryJibeParquet = async (areaCodeName:string, areaCodeValue:string, variable: string, group: string, city: string) => {
  try {
    const response = await fetch(`https://d1txe6hhqa9d2l.cloudfront.net/query/?area=${areaCodeName}&code=${areaCodeValue}&var=${variable}&group=${group}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const headers = data[0].Data.map((item: { VarCharValue: string }) => item.VarCharValue);

// Identify the index of the group by column (e.g., 'gender')
const groupByIndex = headers.indexOf(group);

const areaCodeColumn = `${areaCodeName.toLowerCase()}.home`;
const areaCodeIndex = headers.indexOf(areaCodeColumn);

const jsonData = data.slice(1).reduce((result: { [key: string]: any }, item: { Data: { VarCharValue: string }[] }) => {
  const values = item.Data.map(value => value.VarCharValue);

  // Replace '___' with the value of 'city' in the area code column
  if (values[areaCodeIndex] === '___') {
    values[areaCodeIndex] = city+' (Overall)';
  }

  const areaCode = values[areaCodeIndex];
  const groupByValue = values[groupByIndex];

  if (!result[areaCode]) {
    result[areaCode] = { [areaCodeColumn]: areaCode };
  }
  
  result[areaCode][groupByValue] = headers.reduce((obj: { [key: string]: any }, header: string, index: number) => {
    if (index !== areaCodeIndex && index !== groupByIndex) {
      obj[header] = values[index];
    }
    return obj;
  }, {});
  
  return result;
  }, {});
  
  const formattedData = Object.values(jsonData);
  
  // console.log(formattedData);
  return formattedData;
  } catch (error) {
    console.error('Error querying Jibe Parquet:', error);
    throw error;
  }
};


