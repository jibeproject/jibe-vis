import { scaleOrdinal, scalePoint } from "d3";

// horizontal arc diagram adapted from https://www.react-graph-gallery.com/arc-diagram

const COLORS = ["#e0ac2b", "#e85252", "#6689c6", "#9a6fb0", "#a53253"];
const MARGIN = { top: 0, right: 30, bottom: 120, left: 30 };

type Data = {
  nodes: { id: string; group: string }[];
  links: { source: string; target: string; value: number }[];
};

type ArcDiagramProps = {
  width: number;
  height: number;
  data: Data;
  polarity: number;
  radius: number;
};

export const HorizontalArcDiagram = ({ width, height, data, polarity=1, radius=16}: ArcDiagramProps) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const yOffset = polarity===0?-radius:radius
  const yStart = boundsHeight+yOffset
  // Nodes
  const allNodeNames = data.nodes.map((node) => node.id);
  const allNodeGroups = [...new Set(data.nodes.map((node) => node.group))];

  const xScale = scalePoint().range([0, boundsWidth]).domain(allNodeNames);
  const colorScale = scaleOrdinal<string>()
    .domain(allNodeGroups)
    .range(COLORS);

  const allNodes = data.nodes.map((node) => {
    return (
      <g key={node.id}>
      <circle
        key={node.id}
        cx={xScale(node.id)}
        cy={boundsHeight}
        r={radius}
        fill={colorScale(node.group)}
      />
      <text x={xScale(node.id)} y={boundsHeight+2.5*-yOffset+0.5*radius} textAnchor="middle">
      {node.id}
    </text>
    </g>
    );
  });

  // links
  const allLinks = data.links.map((link, i) => {
    const xStart = xScale(link.source);
    const xEnd = xScale(link.target);

    if (typeof xStart === "undefined" || typeof xEnd === "undefined") {
      return;
    }

    return (
      <path
        key={i}
        d={horizontalArcGenerator(
          xStart, 
          yStart,
          xEnd,
          yStart,
          polarity,
          radius,
        )}
        stroke="black"
        fill="none"
      />
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g
          key="node-links"
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allNodes}
          {allLinks}
        </g>
      </svg>
    </div>
  );
};

/**
 * Get the d attribute of a SVG path element for an arc
 * that joins 2 points horizontally
 * using an Elliptical Arc Curve
 * @returns {string} The d attribute of the path.
 */
const horizontalArcGenerator = (
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  polarity: number,
  radius: number,
) => {
  return [
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#moveto_path_commands
    "M",
    xStart,
    yStart,
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#elliptical_arc_curve
    "A",
    (xStart - xEnd) / radius*radius, // rx: first radii of the ellipse (inflexion point)
    (xStart - xEnd) / radius*radius, // ry: second radii of the ellipse  (inflexion point)
    0, // angle: rotation (in degrees) of the ellipse relative to the x-axis
    0, // large-arc-flag: large arc (1) or small arc (0)
    xStart < xEnd ? Math.abs(1-polarity) : Math.abs(0-polarity), // xStart < xEnd ? 0 : 1,sweep-flag: the clockwise turning arc (1) or counterclockwise turning arc (0)
    // Position of the end of the arc
    xEnd,
    ",",
    yEnd,
  ].join(" ");
};


// const Timeline =  ({ width, height, data }: ArcDiagramProps) => {
  
//     // read the data
//     // compute the nodes position
//     // build the arcs
  
//     return (
//       <div>
//         <svg width={width} height={height}>
//           // render all the arcs and circles
//         </svg>
//       </div>
//     );
//   };

export default HorizontalArcDiagram;