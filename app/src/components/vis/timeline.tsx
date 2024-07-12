import { scaleUtc, scaleOrdinal } from "d3";
import { useChartDimensions } from './custom-hooks'
import { useMemo } from "react";
import { TimeAxis as Axis } from './axis'

// react and d3 advice from https://2019.wattenberger.com/blog/react-and-d3
// horizontal arc diagram adapted from https://www.react-graph-gallery.com/arc-diagram

// const COLORS = ["#e0ac2b", "#e85252", "#6689c6", "#9a6fb0", "#a53253"];
const COLORS = [ "#faccfa",  "#d29343",  "#3c6d56",  "#011959"]
const chartSettings = {
  "marginRight": 100,
  "marginLeft": 100
}


type Data = {
  nodes: { id: number, label: string, group: string, date: string, end: string, offset: number, anchor: string}[];
};

type DiagramProps = {
  width: number;
  height: number;
  data: Data;
  polarity: number;
  radius: number;
};

export const Timeline = ({ width, height, data, polarity=1, radius=16}: DiagramProps) => {
  const yOffset = polarity===0?-radius:radius
  const startDate = new Date(2024,3,15)
  const endDate = new Date(2025,2,15)
  // Nodes
  // const allNodeNames = data.nodes.map((node) => node.id);
  const allNodeGroups = [...new Set(data.nodes.map((node) => node.group))];
  const [ref, dms] = useChartDimensions(chartSettings)
  const xScale = useMemo(() => (
    scaleUtc()
    .domain([startDate, endDate])
    .nice()
    .range([0, dms.boundedWidth])
  ), [dms.boundedWidth])

  const colorScale = scaleOrdinal<string>()
    .domain(allNodeGroups)
    .range(COLORS);
  const durationField = (date: Date, node:any) => {
    if (node.end === "") {
      return <></>
    } else {
      const end = new Date(node.end)
      const width = xScale(end) - xScale(date)
      return (
        <rect
        key={"rect"+node.id}
        x={xScale(date)}
        y={dms.boundedHeight-radius/2}
        // rx="8"  
        // ry="8"  
        width={width}
        height={radius}
        fill={colorScale(node.group)}
      />
      )
    }
  };
  const allNodes = data.nodes.map((node) => {  
    // Dates  
    const date = new Date(node.date)
    const textY = dms.boundedHeight+2.5*-yOffset+0.5*radius+node.offset
    return (
      <g key={node.id}>
      <circle
        key={"circle"+node.id}
        cx={xScale(date)}
        cy={dms.boundedHeight}
        r={radius}
        fill={colorScale(node.group)}
      />
      {durationField(date, node)}
      <text x={xScale(date)} y={textY} textAnchor={node.anchor}>
      {node.label}
      </text>
      <path 
        d={`M ${xScale(date)} ${textY+5} L ${xScale(date)} ${dms.boundedHeight-radius}`} 
        stroke="black"
        strokeWidth="1"/>
    </g>
    );
  });
  const legend_nodes = [...new Set(data.nodes.map((node) => node.group))];
  const legend = legend_nodes.map((node, i) => {  
    // const textY = dms.boundedHeight+2.5*-yOffset+0.5*radius
    return (
      <g key={"legend-"+i}>
      <circle
        key={node}
        cx={i*180}
        cy={0}
        r={radius}
        fill={colorScale(node)}
      />
      <text x={i*180+1.5*radius} y={0.5*radius} textAnchor='start'>
      {node}
      </text>
    </g>
    );
  });
    
  return (
    <div
      className="Chart__wrapper"
      ref={ref}
      style={{ height: "200px" }}>
      <svg id="timeline" width={dms.width} height={dms.height}>
        <g transform={`translate(${[
          dms.marginLeft,
          dms.marginTop
        ].join(",")})`}>
        {legend}
        <g
          key={"node-links"}
          width={width}
          height={height}
        >
          {allNodes}
        </g>
        <g transform={`translate(${[
            0,
            dms.boundedHeight,
          ].join(",")})`}>
          <Axis
            domain={xScale.domain()}
            range={xScale.range()}
            xScale={xScale}
            radius={radius}
            numberOfTicksTarget={13}
          />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Timeline;