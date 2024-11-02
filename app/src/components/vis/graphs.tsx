import { BarChart, Bar, CartesianGrid, Label, LabelList, Legend, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import { Download } from '@mui/icons-material'
import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Dialog, Typography, DialogContent, DialogActions, Button, Link, Box } from '@mui/material';
import { getCategoricalColourList } from './colours';

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
  const [loading, setLoading] = useState(true);
  const [selectedVariable, setSelectedVariable] = useState(Object.keys(scenario.linkage)[0]);
  const [selectedGroup, setSelectedGroup] = useState(Object.keys(scenario.linkage[selectedVariable]['linkage-groups'])[0]);
  const [data, setData] = useState<any[]>([]);
  const [showFullData, setShowFullData] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [_targetThreshold, setTargetThreshold] = useState(null);

  const area = scenario_layer['linkage-code'] ? scenario_layer['linkage-code'] : scenario_layer.index.variable;
  const code = feature.properties[area];
  const areaCodeColumn = `${area.toLowerCase()}.home`;
  const city = scenario.city;
  const stack = Object.keys(scenario.linkage[selectedVariable].stack);
  const stack_no_total = stack.filter((key: string) => !key.endsWith('_total'));
  const colours = getCategoricalColourList(stack_no_total.length);
  
  // console.log(data);
  useEffect(() => {
    const fetchData = async () => {
      const data = await queryJibeParquet({
        areaCodeName: area,
        areaCodeValue: code,
        variable: selectedVariable,
        group: selectedGroup,
        city: city
      });
      setData(data);
      setFilteredData(filterData(data, code));
      if (scenario_layer.target_threshold && scenario_layer.target_threshold[selectedVariable]) {
        setTargetThreshold(scenario_layer.target_threshold[selectedVariable]);
      }
      setLoading(false);
    };

    fetchData();
  }, [area, code, selectedVariable, selectedGroup, city, scenario_layer]);
  
  const handleVariableChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariable(event.target.value);
    setLoading(true);
    const firstGroup = Object.keys(scenario.linkage[event.target.value]['linkage-groups'])[0];
    setSelectedGroup(firstGroup);
  };
  const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(event.target.value);
  };
  const filterData = (data: any[], code: string) => {
    return data.filter(entry => entry[areaCodeColumn] === code || entry[areaCodeColumn] === city + ' (Overall)');
  };
  const handleToggleData = () => {
    setShowFullData(prevState => !prevState);
  };


  const renderCustomLabel = (label: string) => (props: any) => {
    const { x, y, width, height } = props;
    return (
      <text x={Number(x)>100?Number(x) + Number(width)-10:
        Number(x) + Number(width)+10} y={Number(y)+Number(height)/2+5} fill="#000" textAnchor={Number(x)>100?"end":"start"}>
        {label}
      </text>
    );
  };

  if (!open) return null;

  // const BarComponents = () => (
  //   <>
  //     {Object.keys(scenario['linkage-groups']).map((key: string) => (
  //       Object.keys(scenario.linkage[selectedVariable].stack).map((stackKey: string, index) => (
  //         <Bar
  //           key={`${key}.${stackKey}`}
  //           dataKey={`${key}.${stackKey}`}
  //           stackId={key}
  //           fill={colours[index]}
  //           onClick={() => copyTableToTSV()}
  //         >
  //           <LabelList dataKey={`${key}.${stackKey}`} content={renderCustomLabel({ key })} />
  //         </Bar>
  //       ))
  //     ))}
  //   </>
  // );
  // console.log(data);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
      <Typography variant="h6" >
      <select id="linkage-select" className="responsive-select" value={selectedVariable} onChange={handleVariableChange}>
        {Object.keys(scenario.linkage).map(key => (
          <option key={key} value={key}>
            {scenario.linkage[key].title}
          </option>
        ))}</select>
        </Typography >
        <div>
        <Typography variant="body2" >
        Grouped by:&nbsp; 
        <select id="linkage-select" className="responsive-select" value={selectedGroup} onChange={handleGroupChange}>
          {Object.keys(scenario.linkage[selectedVariable]['linkage-groups']).map((key: string) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}</select>
         {!loading ? (
            <Button id="show-full-button" onClick={handleToggleData} style={{ float: 'right' }}>
            {showFullData ? 'Show Filtered Data' : 'Show Full Data'}
            </Button>
        ) : null}
        </Typography>
          </div>
        <div id="modal-popup-container">
          {loading ? (
            <div id="modal-popup-content">
              <CircularProgress />
            </div>
          ) : (
    <div className="responsive-chart" style={{ width: '100%', height: '100%' }}>
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
            <Label value={scenario.linkage[selectedVariable].units} offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis type="category" dataKey={areaCodeColumn}/>
          <Tooltip content={(props) => <CustomTooltip {...props} scenario={scenario} selectedGroup={selectedGroup} selectedVariable={selectedVariable} loaded={!loading}/>} />
          {/* <Tooltip /> */}
          <Legend
            wrapperStyle={{bottom: -50, right: 0}}
            payload={stack_no_total.map((key, index) => ({
              value: scenario.linkage[selectedVariable].stack[key],
              id: key,
              color: colours[index]
            }))}
          />
          {scenario.linkage[selectedVariable]['linkage-groups'][selectedGroup].map((key: string) => (
            stack_no_total.map((stackKey: string, index, array) => {
              return (
                <Bar dataKey={`${key}.${stackKey}`} stackId={key} fill={colours[index]} onClick={() => copyTableToTSV()}>
                  {index === array.length - 1 && data.length * Object.keys(scenario.linkage[selectedVariable]['linkage-groups'][selectedGroup]).length < 100 && (
                  <LabelList dataKey={`${key}.${stackKey}`} content={renderCustomLabel(key)} />
                  )}
                </Bar>
              );
            })
          ))}
          {/* {targetThreshold !== null && (
            <ReferenceLine 
                x={targetThreshold} 
                stroke="black" 
                label={{ position: 'bottom', value: `Target*`, fill: 'black', fontSize: 12 }}
            />
          )} */}
        </BarChart>
      </ResponsiveContainer>
      <Box   marginTop="4em">
      <Typography id="responsive-linkage-text" variant="subtitle2" marginTop="2em">{scenario.linkage[selectedVariable].threshold_description} (<Link href={scenario.linkage[selectedVariable].threshold_url} target="_blank">{scenario.linkage[selectedVariable].threshold_url}</Link>)</Typography>
      </Box>
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

const CustomTooltip = ({ active, payload, scenario, selectedGroup, selectedVariable, loaded }: { active?: any, payload?: any, label?: any, scenario: any, selectedGroup: string, selectedVariable: string, loaded: boolean }) => {
  if (active && payload && payload.length && loaded) {
    const index = payload[0].payload;
    const area = String(Object.values(index)[0]);

    if (!index) {
      return null;
    } else if (scenario && scenario.linkage[selectedVariable]['linkage-groups'] && scenario.linkage[selectedVariable]['linkage-groups'][selectedGroup]) {
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
          <caption>{scenario.linkage[selectedVariable].units}</caption>
          <thead>
            <tr>
              <th scope='col'></th>
              {Object.keys(scenario.linkage[selectedVariable].stack).map((key: string) => (
                <th scope='col' key={key}>{scenario.linkage[selectedVariable].stack[key]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenario.linkage[selectedVariable]['linkage-groups'][selectedGroup].map((key: string) => (
              <tr key={key}>
                <td><b>{key}</b></td>
                {Object.keys(scenario.linkage[selectedVariable].stack).map((stackKey: string) => (
                  <td key={stackKey}>{index[key][stackKey]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <i>Click to copy table to clipboard</i>
      </div>
    );
  }
} else {
  return null;
}
};

const copyTableToTSV = () => {
  const table = document.getElementsByClassName('popup_summary')[0];
  if (!table) return;
  const area = table.getAttribute('id');
  const caption = table.querySelector('caption');
  let tsv = `${area}\n${caption?.textContent}\n`;
  const rows = table.querySelectorAll('tr');

  rows.forEach(row => {
    const cols = row.querySelectorAll('th, td');
    const rowData = Array.from(cols).map(col => col.textContent?.trim()).join('\t');
    tsv += rowData + '\n';
  });
  const currentURL = window.location.href;
  tsv += `\n${currentURL}`;

  navigator.clipboard.writeText(tsv).then(() => {
    console.log(`Table for ${area} copied to clipboard in TSV format`);
  }).catch(err => {
    console.error('Failed to copy table to clipboard: ', err);
  });
};

interface QueryParams {
  areaCodeName?: string;
  areaCodeValue?: string;
  variable?: string;
  group?: string;
  city?: string;
  [key: string]: any; // Allow additional parameters
}

const queryJibeParquet = async ({ areaCodeName, areaCodeValue, variable, group, city }: QueryParams) => {
  try {
    const query = `https://d1txe6hhqa9d2l.cloudfront.net/query/?area=${areaCodeName}&code=${areaCodeValue}&var=${variable}&group=${group}`;
    const response = await fetch(query);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const headers = data[0].Data.map((item: { VarCharValue: string }) => item.VarCharValue);

// Identify the index of the group by column (e.g., 'gender')
const groupByIndex = headers.indexOf(group);

const areaCodeColumn = `${areaCodeName?.toLowerCase()}.home`.replace('cd','nm');
const areaCodeIndex = headers.indexOf(areaCodeColumn);
// console.log(data);
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


