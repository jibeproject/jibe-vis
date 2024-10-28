import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import { Button } from '@mui/material';
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
  const key = scenario_layer['linkage-code']? scenario_layer['linkage-code'] : scenario_layer.index.variable
  const value = feature.properties[key];
  let variables: string[] = [];
  let values: string[] = [];
  try {
    const content = await queryJibeParquet(key, value);
    if (content) {
      if (!content || !Array.isArray(content) || content.length < 2) {
        console.error('Invalid content structure:', content);
        return '<div class="error">Invalid data format</div>';
      }
    
      // Parse the content
      variables = content[0].Data.map((item: { VarCharValue: string }) => item.VarCharValue);
      values = content[1].Data.map((item: { VarCharValue: string }) => item.VarCharValue);
    
      if (scenario_layer['linkage-dictionary']) {
        const dictionary = scenario_layer['linkage-dictionary'];
        variables.forEach((variable: string, index: number) => {
          if (dictionary.hasOwnProperty(variable)) {
            variables[index] = dictionary[variable];
          }
        });
      }
    
      values.forEach((value: string, index: number) => {
        if (value === 'null') {
          values[index] = 'No data';
        } else if (value.includes('p50=')) {
          const p25_p50_p75 = value.slice(1, -1).split(', ').map(
            (item: string) => item.split('=')[1]
          );
    
          values[index] = `${p25_p50_p75[1]} [${p25_p50_p75[0]} to ${p25_p50_p75[2]}]`;
        }
      });
    } else {
      return '';
    }
  } catch (error) {
    console.error(error);
    return <div className="error">Error loading data</div>;
  }

return (
    <table id="indicator_summary">
      <thead>
        <tr>
          <th>Variable</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {variables.map((variable, index) => (
          <tr key={index}>
            <th>{variable}</th>
            <td>{values[index]}</td>
          </tr>
        ))}
      </tbody>
    </table>
);
};





const queryJibeParquet = async (areaCodeName:string, areaCodeValue:string) => {
  try {
    const response = await fetch(`https://d1txe6hhqa9d2l.cloudfront.net/query/?areaCodeName=${areaCodeName}&areaCodeValue=${areaCodeValue}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error querying Jibe Parquet:', error);
    throw error;
  }
};


