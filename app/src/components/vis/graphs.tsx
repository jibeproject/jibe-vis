import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface Feature {
  properties: { [key: string]: any };
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
  

// import { TooltipProps } from 'recharts';

// const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
//     if (active && payload && payload.length) {
//       const { name, value } = payload[0];
//       return (
//         <div className="custom-tooltip">
//           <p className="label">{`${value}%`}</p>
//         </div>
//       );
//     }
//     return null;
//   };


//   const CustomXAxis = ({ type = "number", ...props }) => {
//     return <XAxis type={type} {...props} />;
//   };
  
//   const CustomYAxis = ({ type = "category", width = 200, padding = { top: 10 }, dataKey = "name", ...props }) => {
//     return <YAxis type={type} width={width} padding={padding} dataKey={dataKey} {...props} />;
//   };
  
const formatGraph = (feature: Feature, scenario_layer: ScenarioLayer) => {
    const { properties } = feature;

    // Prepare data for the bar chart
    const data = Object.entries(properties)
        .filter(([key]) => scenario_layer.dictionary.hasOwnProperty(key) && key !== scenario_layer.index.variable)
        .map(([key, value]) => ({ name: scenario_layer.dictionary[key], "value": Number(value).toFixed(1) }));
    // Check if "Target threshold" exists in scenario_layer.legend
    const targetThresholdEntry = scenario_layer.legend.find(entry => entry.label === "Target threshold");
    const targetThresholdValue = targetThresholdEntry ? targetThresholdEntry.range_greq_le[0] : null;
    return (
        <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="horizontal">
            <YAxis type="number"/>
            {targetThresholdValue !== null && (
                <ReferenceLine 
                    y={80} 
                    stroke="black" 
                    label={{ position: 'right', value: '*', fill: 'black', fontSize: 12 }}
                />
            )}
            <XAxis
                type="category"
                height={200}
                dataKey="name"
                interval={0}
                angle={-35}
                textAnchor="end"
            />
            <Tooltip />
            {/* <Legend /> */}
            <Bar dataKey="value" fill="#8884d8">
            </Bar>
        </BarChart>
        </ResponsiveContainer>
    );
};

export default formatGraph;