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
  };
  legend: {
    label: string;
    range_greq_le: number[];
  }[];
}

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