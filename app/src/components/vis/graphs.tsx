import { BarChart, Bar, CartesianGrid, Legend, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import html2canvas from 'html2canvas';
import { Button, Typography } from '@mui/material';
import { Download } from '@mui/icons-material'

interface Feature {
  properties: { [key: string]: any };
  focus: {
    units: string;
  };
}

interface ScenarioLayer {
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


export const formatGraph = (feature: Feature, scenario_layer: ScenarioLayer) => {
    const { properties } = feature;

    // Prepare data for the bar chart
    const data = Object.entries(properties)
        .filter(([key]) => scenario_layer.dictionary.hasOwnProperty(key) && key !== scenario_layer.index.variable)
        .map(([key, value]) => ({ name: scenario_layer.dictionary[key], "value": Number(value).toFixed(1) }));
    console.log(data);
    // Calculate the maximum observed value
    // const maxValue = Math.max(...data.map(d => parseFloat(d.value)));
    const maxLegendValue = Math.max(...scenario_layer.legend.flatMap(entry => entry.range_greq_le));

        // Check if "Target threshold" exists in scenario_layer.legend
    const targetThresholdEntry = scenario_layer.legend.find(entry => entry.label === "Target threshold");
    const targetThresholdValue = targetThresholdEntry ? targetThresholdEntry.range_greq_le[0] : null;

    return (
        <div>
                <ResponsiveContainer width="95%" height={400} minWidth={400}>
                    <BarChart data={data} layout="vertical" margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <XAxis 
                          type="number"
                          domain={[0, maxLegendValue]}
                          />
                        {targetThresholdValue !== null && (
                            <ReferenceLine 
                                x={targetThresholdValue} 
                                stroke="black" 
                                label={{ position: 'top', value: `Target (${targetThresholdValue} ${feature.focus.units})`, fill: 'black', fontSize: 12 }}
                            />
                        )}
                        <YAxis
                            type="category"
                            width={300}
                            dataKey="name"
                            interval={0}
                            textAnchor="end"
                        />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
        </div>
    );
};

export const formatLinkage = async (feature :any, scenario_layer: any) => {  
  // draws on Rachel McQuater's example 
  // https://spin.atomicobject.com/stacked-bar-charts-recharts/
  const area = scenario_layer['linkage-code']? scenario_layer['linkage-code'] : scenario_layer.index.variable
  const code = feature.properties[area];
  const areaCodeColumn = `${area.toLowerCase()}.home`;
  const variable = "mmethr"
  const group = "gender"
  const data = await queryJibeParquet(area, code, variable, group);
  const red = "#fc4e57";
  const purple = "#a3488b";
  const blue = "#3196bc";
  const title = "Metabolic equivalent (MET) physical activity (hours/week)"
  let targetThreshold;
  if (scenario_layer.target_threshold && scenario_layer.target_threshold[variable]) {
    targetThreshold = scenario_layer.target_threshold[variable]
  } else {
    targetThreshold = null
  }
  // console.log(targetThreshold);
  // const CustomBar: React.FC<{ dataKey: string; stackId: string; fill: string}> = ({ dataKey, stackId, fill }) => (
  //   <Bar dataKey={dataKey} stackId={stackId}>
  //     {data.map((entry: any, index) => (
  //       <Cell key={`cell-${index}`} fill={entry[areaCodeColumn] === code ? 'yellow' : fill} />
  //     ))}
  //   </Bar>
  // );
return (
  <div style={{ width: '100%', height: '100%' }}>
  <Typography variant="h5">{title}</Typography>
   <ResponsiveContainer width="95%" height={400} minWidth={400}>
    <BarChart
      width={800}
      height={300}
      data={data}
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
      <XAxis type="number" />
      {targetThreshold !== null && (
          <ReferenceLine 
              x={targetThreshold} 
              stroke="black" 
              label={{ position: 'bottom', value: `(Target ${targetThreshold})`, fill: 'black', fontSize: 12 }}
          />
      )}
      <YAxis type="category" dataKey={areaCodeColumn}/>
      <Tooltip content={CustomTooltip} />
      <Legend
          payload={[
            { value: "Walking", id: "mmethr_walk", color: red },
            { value: "Cycling", id: "mmethr_cycle", color: purple },
            { value: "Other sport", id: "mmethr_othersport", color: blue }
          ]}
      />
      <Bar dataKey="Female.mmethr_walk" stackId="a" fill={red} label={"Female"}/>
      <Bar dataKey="Female.mmethr_cycle" stackId="a" fill={purple} label={"Female"}/>
      <Bar dataKey="Female.mmethr_othersport" stackId="a" fill={blue} label={"Female"}/>
      <Bar dataKey="Male.mmethr_walk" stackId="b" fill={red} label={"Male"}/>
      <Bar dataKey="Male.mmethr_cycle" stackId="b" fill={purple} label={"Male"} />
      <Bar dataKey="Male.mmethr_othersport" stackId="b" fill={blue} label={"Male"} />
    </BarChart>
  </ResponsiveContainer>
  </div>
);
};

const CustomTooltip = ({
  active,
  payload
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload) {
    const index = payload[0].payload;
    return (
      <div
        key={index.date}
        style={{
          padding: "6px",
          backgroundColor: "white",
          border: "1px solid grey"
        }}
      >
        <b>{index.date}</b>
        <div style={{ display: "flex" }}>
          <div style={{ marginRight: "10px" }}>
            <b>Female</b>
            <p>Walk: {index.Female.mmethr_walk}</p>
            <p>Cycle: {index.Female.mmethr_cycle}</p>
            <p>Other sport: {index.Female.mmethr_othersport}</p>
          </div>
          <div>
            <b>Male</b>
            <p>Walk: {index.Male.mmethr_walk}</p>
            <p>Cycle: {index.Male.mmethr_cycle}</p>
            <p>Other sport: {index.Male.mmethr_othersport}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};




const queryJibeParquet = async (areaCodeName:string, areaCodeValue:string, variable: string, group: string) => {
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
    values[areaCodeIndex] = 'City average';
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


