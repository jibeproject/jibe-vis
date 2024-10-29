import { scalePoint } from "d3";
import { useChartDimensions } from './custom-hooks'
import { GroupedData, UnGroupedData } from './processFeatureData'
import { Flex, View, Heading} from '@aws-amplify/ui-react';
import _ from 'lodash';
import './code-hierarchy.css';
import InfoDialog from '../info_dialog';
import Button from "@mui/material/Button";
import { useMemo, useState } from "react";
import { capitalString } from '../utilities';
import { DownloadChartAsPng } from './graphs';

const COLORS = ["#e0ac2b", "#e85252", "#6689c6", "#9a6fb0", "#a53253"];
const chartSettings = {
    "marginRight": 20,
    "marginLeft": 20
}

type DiagramProps = {
    data: GroupedData;
    radius: number;
    feature: string;
    interpretation: string;
    tweak: number;
};

function generate_SVG(data:any, className:string, ref:any, dms:any) {
  return (
      <div 
        className={`${className}Wrapper`}
        ref={ref}
        style={{ height: "800px" }}
        // style={{ height: `${dms.height}`}}
        >
      <svg className={className} width={dms.width} height={dms.height}>
      {/* <title id="{className}-title">{title}</title> */}
      <g
        key="chart__data"
        width={dms.boundedWidth}
        height={dms.boundedHeight}
        transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}
      >
        {data}
      </g>
    </svg>
    </div>
  );
};

function generateIntersecting(intersecting:string[], order: number, total:number, scale:number, xref:number, radius:number=4, column:number) {
    const n = intersecting.length;
    const related_themes = n===0? 'No related themes recorded': 'Related themes';
    // console.log([n, order, total,order+n/2, order+n/2>total])
    let offset:number=0;
    if (order+n/2>total) {
      offset = n*14+(total-order);
    } else if (order-n/2<0) {
      offset = 0+order*10
    }
    else {
      offset = n*10
    }
    const xpos = column-40
    const nodes = intersecting.map((node, i) => {
        const label = node[0].split('\\').at(-1);
        const labelText = capitalString(label??'');
        const references = Number(node[1]);
        const dimensions = 2*Math.sqrt(references);
        const threshold = 3
        const priority = references>threshold
        const edge_id = priority?'FeatureLink-priority':'FeatureLink';
        const node_id = priority?'FeatureNode-priority':'FeatureNode';
        const ypos = scale-offset+i*20;
        return (
          <g key={"intersection"+i}>
            <path
          key={i}
          id={edge_id}
          d={ArcGenerator(xpos, ypos, xref+radius*2, scale )}
            stroke="black"
            fill="none"
          />
            <circle
                key={"circle"+i}
                className="FeatureIntersection"
                cy={ypos}
                cx={xpos}
                r={dimensions}
                id = {node_id}
                />
            <title>{n} intersecting nodes</title>
            <text key={"text"+i} className="FeatureIntersection" y={ypos+radius} x={xpos-10} textAnchor="end">
            {labelText}
            </text>
          </g>
        )
    });
  return (
    <g key="intersection" className="FeatureIntersection" >
    {/* <rect className="hidden" x={0} y={scale-offset-40} width={xref} height={20*n+20}/> */}
    <text className="IntersectingTitle" x={xpos-10} y={scale-offset-18} textAnchor="end">{related_themes}</text>
    {nodes}
    </g>
  );
};

const ArcGenerator = (
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number
) => {
    return [
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#moveto_path_commands
      "M",
      xStart,
      yStart,
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#elliptical_arc_curve
      "A",
      (yStart - yEnd) / .1, // rx: first radii of the ellipse (inflexion point)
      (yStart - yEnd) / .1, // ry: second radii of the ellipse  (inflexion point)
      0, // angle: rotation (in degrees) of the ellipse relative to the x-axis
      0, // large-arc-flag: large arc (1) or small arc (0)
      yStart > yEnd ? 1 : 0, // xStart < xEnd ? 0 : 1,sweep-flag: the clockwise turning arc (1) or counterclockwise turning arc (0)
      // Position of the end of the arc
      xEnd,
      ",",
      yEnd,
    ].join(" ");      
};

export const Hierarchy = ({ data, radius=16, feature="Features", interpretation="", tweak=0}: DiagramProps) => {
    const [ref, dms] = useChartDimensions(chartSettings)
    const [orderBy, setOrderBy] = useState('alphabetically');
    dms.height = tweak*dms.height
    dms.boundedHeight = tweak*dms.boundedHeight
    const value = data[feature]
    const n = Object.keys(value).length;
    const referenceGroupMap = Object.entries(value)
    .map(([code, stats]) => {
      const hierarchy = code.split('\\');
      const label = hierarchy.at(-1);
      const index = hierarchy.indexOf(label ? label : hierarchy[0]);
      const parents = hierarchy.slice(0,-1).join('\\')
      return [code, { ...stats, parents, index, label }];
    });
    // console.log(referenceGroupMap)
    var nodes:any = {};
    const sortedNodes: UnGroupedData = useMemo<UnGroupedData>(() => {
      if (orderBy === 'alphabetically') {
        return value;
      } else if (orderBy === 'mentions') {
        return Object.fromEntries(
          referenceGroupMap.sort(([, a], [, b]) => {
            if ((typeof a !== 'string' && typeof a.parents !== 'undefined') && (typeof b !== 'string' && typeof b !== 'undefined')) {
                return b.References - a.References;  
            }
            return 0; // Add this line to return a default value
          })
        )
    }
  }, [value, orderBy]);
    const Scale = scalePoint()
        .domain(Object.keys(sortedNodes))
        .range([0, dms.boundedHeight]);
    nodes = Object.entries(sortedNodes).map(([code,stats],i) => {
      const scale = Scale(code)
      if (scale===undefined) {
        return (
          <></>
        );
      } 
      const hierarchy = code.split('\\');
      const label = hierarchy.at(-1);
      const labelText = capitalString(label??'');
      const index = hierarchy.indexOf(label ? label : hierarchy[0]);
      const indent = orderBy === 'mentions' ? 0 : (index) * radius * 5;
      const column = dms.boundedWidth/2;
      const text_id = 'subcategory-'+indent;
      const dimensions = 2*Math.sqrt(Number(stats.References));
      const colour = COLORS[0]
      const xref = column+indent
      // console.log(label)
      const interactions = generateIntersecting(stats.Intersecting, i, n, scale, xref, 2, column);
      return (
        <g className="FeatureHierarchy" key={i}>
          <text className="Feature" id={text_id} y={scale+5} x={xref+2.5*radius} textAnchor="start">
          {labelText}
          </text>
        <circle
        key={i}
        className="Feature"
        cy={scale}
        cx={xref+radius}
        r={dimensions}
        fill={colour}
        />
        <title>{stats['References']} mentions</title>
        {interactions}
      </g>
      );
  });
  return (
    <Flex direction='column'>
      <View
        // minWidth={'570px'}
        maxWidth="100%"
        padding="1rem"
        textAlign="center"
        >
          <span id='Feature-Info'>
           { InfoDialog({title: feature, content: interpretation, top: '1.5em'}) }
           <Heading level={2} order={1}>{feature}</Heading>
          </span>
           <Button onClick={() => setOrderBy('alphabetically')}>Sort alphabetically</Button>
           <Button onClick={() => setOrderBy('mentions')}>Sort by mentions</Button>
           {/* <DownloadChartAsPng elementId="PriorityPlanningWrapper" /> */}
        </View>    
        <View 
          padding={{ base: '0rem', large: '1rem'}}
          width='100%'
          id="PriorityPlanningWrapper"
          >
          {generate_SVG(nodes, 'FeatureHierarchy',ref, dms)}
        </View>
    </Flex>
  );

};
