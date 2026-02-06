import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, CartesianGrid, Label, LabelList, Legend, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import Download from '@mui/icons-material/Download';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { getCategoricalColourList } from './colours';
import { ShareButton } from '../share';
import { FocusFeature } from '../utilities';
  
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
    <Button onClick={handleClick} color="primary" startIcon={<Download />} title="Download .png image">
      Download
    </Button>
  );
};

export function GraphPopupWrapper({ feature, scenario_layer, scenario, open, onClose, mapQuery }: { feature: maplibregl.MapGeoJSONFeature, scenario_layer: ScenarioLayer, scenario: any, open: boolean, onClose: () => void, mapQuery : {[key: string]: string}}) {
  
  if (scenario_layer.popup==='graph') {
    return popupGraph(feature, scenario_layer, open, onClose);
  } else {
    return popupLinkage({ feature, scenario_layer, scenario, open, onClose, mapQuery });
  }
};



export function popupLinkage ({ feature, scenario_layer, scenario, open, onClose, mapQuery }: { feature: maplibregl.MapGeoJSONFeature, scenario_layer: ScenarioLayer, scenario: any, open: boolean, onClose: () => void, mapQuery:  {[key: string]: string} }) {
  const [focusFeature, _] = useState(new FocusFeature({}));
  const isPopupInitialized = useRef(false);
  const isProgrammaticChange = useRef(false);

  const [loading, setLoading] = useState(true);
  const [selectedVariable, setSelectedVariable] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [showFullData, setShowFullData] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [targetThreshold, setTargetThreshold] = useState(null);
  const [selectedLegendItems, setSelectedLegendItems] = useState<Set<string>>(new Set());
  
  const area = scenario_layer['linkage-code'] ? 
    scenario_layer['linkage-code'] : 
    scenario_layer.index.variable;
  const code = feature.properties[area];
  const areaCodeColumn = `${area.toLowerCase()}.home`;
  const city = scenario.city;
  const stack = selectedVariable ? Object.keys(scenario.linkage[selectedVariable].stack) : [];
  const stack_no_total = stack.filter((key: string) => !key.endsWith('_total'));
  const colours = getCategoricalColourList(stack_no_total.length);

  // Add handler for legend click
  const handleLegendClick = (legendItem: any) => {
    if (stack.length <= 1) return; // Only enable for multiple stacks
    
    const itemId = legendItem.id || legendItem.value;
    setSelectedLegendItems(prev => {
      const newSet = new Set<string>();
      
      // If clicking the currently selected item, clear selection (show all)
      if (prev.has(itemId) && prev.size === 1) {
        return newSet; // Empty set = show all
      }
      
      // Otherwise, select only this item
      newSet.add(itemId);
      return newSet;
    });
  };

  useEffect(() => {
    setSelectedLegendItems(new Set());
  }, [selectedVariable, selectedGroup]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const variable = params.get('popupVariable');
    const group = params.get('popupGroup');
    const region = params.get('popupRegion');
    focusFeature.update(mapQuery);
    focusFeature.update({
      popupVariable: encodeURIComponent(selectedVariable) ?? '',
      popupGroup: encodeURIComponent(selectedGroup) ?? '',
      popupRegion: encodeURIComponent(selectedRegion) ?? ''
    });

    if (region) {
      setSelectedRegion(region);
      if (region === 'All') {
        setShowFullData(true);
      }
    } else {
      setSelectedRegion('Selected');
    }
    if (variable && scenario.linkage[variable]) {
      setSelectedVariable(variable);
      if (group && scenario.linkage[variable]['linkage-groups'][group]) {
        setSelectedGroup(group);
      } else {
        setSelectedGroup(Object.keys(scenario.linkage[variable]['linkage-groups'])[0]);
      }
    } else {
      const variable = Object.keys(scenario.linkage)[0]
      const group = Object.keys(scenario.linkage[variable]['linkage-groups'])[0]
      setSelectedVariable(variable);
      setSelectedGroup(group);
    }
    isPopupInitialized.current = true;
  }, [location.search, scenario.linkage]);

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
      if (
        scenario.linkage[selectedVariable]?.threshold && 
        scenario.linkage[selectedVariable].threshold[selectedVariable]
      ) {
        setTargetThreshold(
          scenario.linkage[selectedVariable].threshold[selectedVariable]
        );
      }
      setLoading(false);
    };

    if (selectedVariable && selectedGroup) {
      fetchData();
    }
  }, [area, code, selectedVariable, selectedGroup, city, scenario_layer]);

  // Update URL query string when selectedVariable or selectedGroup changes
  useEffect(() => {
    if (isPopupInitialized.current && !isProgrammaticChange.current) {
      isProgrammaticChange.current = true;
      focusFeature.update({
        popupVariable: encodeURIComponent(selectedVariable) ?? '',
        popupGroup: encodeURIComponent(selectedGroup) ?? '',
        popupRegion: encodeURIComponent(selectedRegion) ?? ''
      });
    } else {
      isProgrammaticChange.current = false;
    }
  }, [selectedVariable, selectedGroup, selectedRegion, focusFeature]);
  
  const handleVariableChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newVariable = event.target.value;
    if (scenario.linkage[newVariable]) {
      setSelectedVariable(newVariable);
      setLoading(true);
      if (selectedGroup && !scenario.linkage[newVariable]['linkage-groups'][selectedGroup]) {
        const firstGroup = Object.keys(scenario.linkage[newVariable]['linkage-groups'])[0];
        setSelectedGroup(firstGroup);
      }
      isProgrammaticChange.current = false; 
    }
  };

  const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(event.target.value);
    isProgrammaticChange.current = false; 
  };
  const filterData = (data: any[], code: string) => {
    return data.filter(entry => entry[areaCodeColumn] === code || entry[areaCodeColumn] === 'Greater region');
  };
  const handleToggleData = () => {
    setShowFullData(prevState => !prevState);
    setSelectedRegion(prevState => prevState === 'Selected' ? 'All' : 'Selected');
    isProgrammaticChange.current = false; 
  };


  const renderCustomLabel = (label: string) => (props: any) => {
    const { x, y } = props;
    return (
      <text x={showFullData?Number(x): Number(x)-10} y={showFullData? Number(y)+2: Number(y)} fill="#666" textAnchor="end">
        {label}
      </text>
    );
  };
  const renderCustomStackLabel = (label: string) => (props: any) => {
    const { x, y } = props;
    return (
      <text x={showFullData?Number(x): Number(x)-10} y={showFullData? Number(y)+10: Number(y)+40} fill="#666" textAnchor="end">
        {label}
      </text>
    );
  };
  const CustomYAxisTick = ({ x, y, payload }: { x: number, y: number, payload: { value: string } }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-150} y={0} dy={0} textAnchor="start" fill="#000" fontWeight={600}>
          {payload.value}
        </text>
      </g>
    );
  };
  // console.log(data);
  if (!open) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Typography variant="h6" >
          <select id="linkage-select" 
            className="responsive-select" 
            value={selectedVariable} 
            onChange={handleVariableChange}
            >
            {Object.keys(scenario.linkage).map(key => (
              <option key={key} value={key}>
                {scenario.linkage[key].title}
              </option>
            ))}
          </select>
        </Typography >
        <div>
        <Typography variant="body2" >
          Grouped by:&nbsp; 
          <select id="linkage-select" 
            className="responsive-select" 
            value={selectedGroup} 
            onChange={handleGroupChange}>
              {selectedVariable && scenario.linkage[selectedVariable] && 
               Object.keys(
                scenario.linkage[selectedVariable]['linkage-groups']
              ).map((key: string) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </Typography>
      <Button 
        id="show-full-button" 
        onClick={!loading ? handleToggleData : undefined}
        title={showFullData ? 
          'Click to view selection only' : 
          'Click to View All Regions'
        }
      >
        {showFullData ? 'All regions' : 'Selected region'}
      </Button>
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
        barCategoryGap={showFullData?2:12}
        barGap={showFullData?1:8}
        margin={{
          top: 0,
          right: 0,
          left: 100,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number"  >
          <Label value={scenario.linkage[selectedVariable].units} 
          position="insideBottom" dy={10} 
          />
        </XAxis>
        <YAxis type="category" dataKey={areaCodeColumn} 
        tick={(props) => <CustomYAxisTick {...props} />} />
        <Tooltip 
          content={(props) => <CustomTooltip 
            {...props} 
            scenario={scenario} 
            selectedGroup={selectedGroup} 
            selectedVariable={selectedVariable} 
            loaded={!loading}
            selectedLegendItems={selectedLegendItems}
          />} 
        />
        {stack.length === 1 ? (

        <Legend
        wrapperStyle={{ bottom: -50, right: 0 }}
        payload={[
          ...stack_no_total.map((key) => ({
            value: `${scenario.linkage[selectedVariable].stack[key]} (Reference)`,
            id: `${key}.reference`,
            color: colours[0]
          })),
          ...stack_no_total.map((key) => ({
            value: `${scenario.linkage[selectedVariable].stack[key]} (Intervention)`,
            id: `${key}.intervention`,
            color: colours[1]
          }))
        ]}
      />
        ): (
        <Legend
  wrapperStyle={{ bottom: -50, right: 0 }}
  onClick={handleLegendClick}
  iconType="rect"
  payload={stack_no_total.map((key, index) => ({
    value: scenario.linkage[selectedVariable].stack[key],
    id: key,
    color: colours[index],
    inactive: selectedLegendItems.size > 0 && !selectedLegendItems.has(key)
  }))
}
  formatter={(value: string, entry: any) => (
    <span style={{ 
      cursor: 'pointer',
      opacity: selectedLegendItems.size === 0 ? 1 : (selectedLegendItems.has(entry.id) ? 1 : 0.4)
    }}>
      {value}
    </span>
  )}
/>
        )} 
        
         {stack.length === 1 ? (
          scenario.linkage[selectedVariable]['linkage-groups'][selectedGroup].map((key: string) =>
            stack_no_total.map((stackKey: string, index, array) => (
              ['reference', 'intervention'].map((scenarioType, scenarioIndex) => (
                <Bar
                  key={`${key}.${stackKey}.${scenarioType}`}
                  dataKey={`${key}.${scenarioType}.${stackKey}`}
                  stackId={`${key}.${scenarioType}`}
                  fill={colours[scenarioIndex]}
                  onClick={() => copyTableToTSV()}
                >
                  {scenarioIndex===1 && index === array.length - 1 && data.length * Object.keys(scenario.linkage[selectedVariable]['linkage-groups'][selectedGroup]).length < 100 && (
                    <LabelList dataKey={`${key}.${scenarioType}.${stackKey}`} content={renderCustomLabel(key)} />
                  )}
                </Bar>
              ))
            ))
          )
        ) : (
      <>
        {scenario.linkage[selectedVariable]['linkage-groups'][selectedGroup].map((key: string) =>
          stack
            .filter((stackKey: string) => selectedLegendItems.size === 0 || selectedLegendItems.has(stackKey))
            .map((stackKey: string, filterIndex) => {
              const index = stack_no_total.indexOf(stackKey);
              // Show label on the first filtered stack item for this group
              const shouldShowLabel = filterIndex === 0;
              return ['reference', 'intervention'].map((scenarioType, scenarioIndex) => (
                <Bar 
                  key={`${key}.${scenarioType}.${stackKey}`}
                  dataKey={`${key}.${scenarioType}.${stackKey}`} 
                  stackId={key} 
                  fill={colours[index]} 
                  onClick={() => copyTableToTSV()}
                >
                  {shouldShowLabel && scenarioIndex === 0 && data.length * Object.keys(scenario.linkage[selectedVariable]['linkage-groups'][selectedGroup]).length < 100 && (
                    <LabelList dataKey={`${key}.${scenarioType}.${stackKey}`} content={renderCustomStackLabel(key)} />
                  )}
                </Bar>
              ));
            })
        )}
      </>
        )}
        {targetThreshold !== null && (
            <ReferenceLine 
                x={targetThreshold} 
                stroke="black" 
                label={{ position: 'bottom', value: `Target*`, fill: 'black', fontSize: 12 }}
            />
          )}
      </BarChart>
      </ResponsiveContainer>
      <Box   marginTop="4em">
      <Typography id="responsive-linkage-text" variant="subtitle2" marginTop="1em">{scenario.linkage[selectedVariable].threshold_description} (<Link href={scenario.linkage[selectedVariable].threshold_url} target="_blank">{scenario.linkage[selectedVariable].threshold_url}</Link>)</Typography>
      </Box>
    </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <ShareButton focusFeature={focusFeature as FocusFeature}/>
        <DownloadChartAsPng elementId="modal-popup-container" />
        <Button onClick={onClose} color="primary" title="Return to map">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};


const CustomTooltip = ({ active, payload, scenario, selectedGroup, selectedVariable, loaded, selectedLegendItems }: { active?: any, payload?: any, label?: any, scenario: any, selectedGroup: string, selectedVariable: string, loaded: boolean, selectedLegendItems: Set<string> }) => {
  if (active && payload && payload.length && loaded) {
    const index = payload[0].payload;
    const area = String(Object.values(index)[0]);
    const allStack = Object.keys(scenario.linkage[selectedVariable].stack);
    const stack_no_total = allStack.filter((key: string) => !key.endsWith('_total'));
    
    // Get the total key if it exists
    const stackTotal = scenario.linkage[selectedVariable]['total'];
    
    // Filter stack based on selection, always include total if it exists
    let stack = selectedLegendItems.size === 0 
      ? allStack 
      : allStack.filter((key: string) => selectedLegendItems.has(key) || key === stackTotal);
    
    // Use the original stack length to determine the table structure, not the filtered stack
    const isSimpleReferenceIntervention = stack_no_total.length === 1;
    
    // console.log(payload);
    if (!index) {
      return null;
    } else if (scenario && scenario.linkage[selectedVariable]['linkage-groups'] && scenario.linkage[selectedVariable]['linkage-groups'][selectedGroup]) {
      if (isSimpleReferenceIntervention) {
      // Group data by group and scenario type
      const groupedData = payload.reduce((acc: any, entry: any) => {
        const [group, scenarioType] = entry.dataKey.split('.');
        if (!acc[group]) {
          acc[group] = {};
        }
        if (!acc[group][scenarioType]) {
          acc[group][scenarioType] = [];
        }
        acc[group][scenarioType].push(entry);
        return acc;
      }, {});
      // console.log(groupedData);
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
            <table id={area} className='popup_summary'>
              <caption>{scenario.linkage[selectedVariable].units}</caption>
              <thead>
                <tr>
                  <th scope='col'></th>
                  <th scope='col'>Reference</th>
                  <th scope='col'>Intervention</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedData).map((group: string, index) => (
                  <tr key={`tr-${group}-${index}`}>
                    <td key={`td-${group}-${index}`}><b>{group}</b></td>
                        <td key={`td2-${group}-${index}`}>
                          {groupedData[group].reference ? groupedData[group].reference.map((entry: any) => entry.value).join(', ') : 'N/A'}
                        </td>
                        <td key={`td3-${group}-${index}`}>
                          {groupedData[group].intervention ? groupedData[group].intervention.map((entry: any) => entry.value).join(', ') : 'N/A'}
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Typography id={'tableCopyAdvice-'+area} variant="caption" fontStyle={'italic'} key="caption1">Click to copy table to clipboard</Typography>
          </div>
      )} else {
        // Group data by group and scenario type
        const groupedData = payload.reduce((acc: any, entry: any) => {
          const [group, scenarioType] = entry.dataKey.split('.');
          if (!acc[group]) {
            acc[group] = {};
          }
          if (!acc[group][scenarioType]) {
            acc[group][scenarioType] = [];
          }
          acc[group][scenarioType].push(entry);
          return acc;
        }, {});
        
      const totalStack = { ...scenario.linkage[selectedVariable]['stack'] };
      const totalData = { ...groupedData }
      
      // Create filtered totalStack that only includes selected items
      const filteredTotalStack: { [key: string]: string } = {};
      stack.forEach(key => {
        filteredTotalStack[key] = totalStack[key] || 'Total';
      });
      if (stackTotal) {
        // Add the total value to totalData
        Object.keys(totalData).forEach(group => {
          if (totalData[group][group] && totalData[group][group][0] && totalData[group][group][0]['payload'][group][group][stackTotal]) {
            totalData[group][group].push({
                dataKey: `${group}.${group}.${stackTotal}`,
                name: `${group}.${group}.${stackTotal}`,
                value: totalData[group][group][0]['payload'][group][group][stackTotal]
            });
          }
        });
        filteredTotalStack['Total'] = 'Total';
        stack.push('Total');
      };
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
    <table id={area} className='popup_summary'>
      <caption>{scenario.linkage[selectedVariable].units}</caption>
      <thead>
        <tr key="tr0" >
          <th key="th0" scope='col'></th>
          {stack.map((stackKey: string, index) => (
            <th scope='col' key={`th-stack-${index}`}>{filteredTotalStack[stackKey]}</th>
          ))}
        </tr>
      </thead>
      <tbody key="tbody1">
      {Object.keys(totalData).map((group: string, index) => (
      <tr key={`tr1-${group}-${index}`}>
        <td key={`td1-${group}-${index}`}><b>{group}</b></td>
        {totalData[group][group].map((entry: any) => (
          <td key={`td2-${entry.dataKey}-${index}-stack`}>{entry.value}</td>
        ))}
      </tr>
    ))}
      </tbody>
    </table>
    <Typography id={'tableCopyAdvice-'+area} variant="caption" fontStyle={'italic'} key="caption1">Click to copy table to clipboard</Typography>
  </div>
      )};
    }
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

  const tableCopiedAdvice = document.getElementById('tableCopyAdvice-'+area);
  if (tableCopiedAdvice) {
    tableCopiedAdvice.innerHTML = `Copied table data for ${area} to clipboard.`;
  }
};

interface QueryParams {
  areaCodeName?: string;
  areaCodeValue?: string;
  variable?: string;
  group?: string;
  city?: string;
  [key: string]: any; // Allow additional parameters
}

const queryJibeParquet = async ({ areaCodeName, areaCodeValue, variable, group }: QueryParams) => {
  try {
    const query = `https://d1txe6hhqa9d2l.cloudfront.net/query/?area=${areaCodeName}&code=${areaCodeValue}&var=${variable}&group=${group}`;
    const response = await fetch(query);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
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
    values[areaCodeIndex] = 'Greater region';
  }

  const areaCode = values[areaCodeIndex];
  const groupByValue = values[groupByIndex];

  if (!result[areaCode]) {
    result[areaCode] = { [areaCodeColumn]: areaCode };
  }

  if (!result[areaCode][groupByValue]) {
    result[areaCode][groupByValue] = {};
  }

  const scenarioIndex = headers.indexOf('scenario');
  const scenario = values[scenarioIndex]; 

  // console.log(headers);
  result[areaCode][groupByValue][scenario] = headers.reduce((obj: { [key: string]: any }, header: string, index: number) => {
    if (index !== areaCodeIndex && index !== groupByIndex && index !== scenarioIndex) {
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


function popupGraph(feature: maplibregl.MapGeoJSONFeature, scenario_layer: ScenarioLayer, open: boolean, onClose: () => void) {
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
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, maxLegendValue]} />
                <YAxis type="category" width={300} dataKey="name" interval={0} textAnchor="end" />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
                {targetThresholdValue !== null && (
                  <ReferenceLine
                    x={targetThresholdValue}
                    stroke="black"
                    label={{
                      position: 'top',
                      value: `Target (${targetThresholdValue} ${scenario_layer.focus.units})`,
                      fill: 'black',
                      fontSize: 12
                    }} />
                )}
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

