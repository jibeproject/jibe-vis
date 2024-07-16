import { scalePoint } from "d3";
import { useChartDimensions } from './custom-hooks'
import { GroupedData } from './processFeatureData'
import { Flex, View, Heading} from '@aws-amplify/ui-react';
import _ from 'lodash';
import './code-hierarchy.css';

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
        const label = node.split('\\').at(-1);
        const ypos = scale-offset+i*20;
        return (
          <g key={"intersection"+i}>
            <path
          key={i}
          id="FeatureLink"
          d={ArcGenerator(xpos, ypos, xref+radius*2, scale )}
            stroke="black"
            fill="none"
          />
            <circle
                key={"circle"+i}
                className="FeatureIntersection"
                cy={ypos}
                cx={xpos}
                r={radius}
                // fill="#2caa4a"
                />
            <title>{n} intersecting nodes</title>
            <text key={"text"+i} className="FeatureIntersection" y={ypos+radius} x={xpos-10} textAnchor="end">
            {label}
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
    dms.height = tweak*dms.height
    dms.boundedHeight = tweak*dms.boundedHeight
    const value = data[feature]
    const n = Object.keys(value).length;
    var nodes:any = {};
    const Scale = scalePoint()
        .domain(Object.keys(value))
        .range([0, dms.boundedHeight]);
    nodes = Object.entries(value).map(([code,stats],i) => {
      const scale = Scale(code)
      if (scale===undefined) {
        return (
          <></>
        );
      } 
      const hierarchy = code.split('\\');
      const label = hierarchy.at(-1);
      const index = hierarchy.indexOf(label ? label : hierarchy[0]);
      const indent = (index)*radius*5;
      const column = dms.boundedWidth/2;
      const text_id = 'subcategory';
      const dimensions = 2*Math.sqrt(Number(stats.References));
      const colour = COLORS[0]
      const xref = column+indent
      // console.log(label)
      const interactions = generateIntersecting(stats.Intersecting, i, n, scale, xref, 2, column);
      return (
      <g className="FeatureHierarchy" key={i}>
          <text className="Feature" id={text_id} y={scale+5} x={xref+2.5*radius} textAnchor="start">
          {label}
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
        margin="auto"
        >
          <Heading level={2} order={1}>{feature}</Heading>
        </View>    
        <Flex direction={{ base: 'column', large: 'row'}}>
          <View
            // minWidth={'570px'}
            maxWidth={{ base: '100%', large: '50%'}}
            padding="1rem"
            >
          <Heading level={4}> {interpretation}</Heading>
          </View>
        <View 
          padding={{ base: '1rem', large: '1rem'}}
          width={{ base: '100%', large: '50%'}}
          marginTop={24}
          >
    {/* <div
      className="FeatureHierarchyWrapper"
      > */}
      {/* <Heading level={5} order={6}>Identified themes</Heading>
      <Heading level={6} order={7}>hover to view intersecting themes</Heading> */}
      {generate_SVG(nodes, 'FeatureHierarchy',ref, dms)}
    {/* </div> */}
    </View>
    </Flex>
    </Flex>
  );

};
