import { scaleUtc, scaleOrdinal } from "d3";
import { useChartDimensions } from './custom-hooks';
import { useMemo, useState, useEffect, useRef } from "react";
import { TimeAxis as Axis } from './axis';
import { MdReplay, MdRepeat, MdPlayArrow } from 'react-icons/md';
import Button from '@mui/material/Button'
import './timeline.css'
// react and d3 advice from https://2019.wattenberger.com/blog/react-and-d3
// horizontal arc diagram adapted from https://www.react-graph-gallery.com/arc-diagram

const COLORS = [ "#faccfa",  "#d29343",  "#011959", "#3c6d56"];
const chartSettings = {
  "marginRight": 100,
  "marginLeft": 100
};

type Data = {
  nodes: { label: string, group: string, date: string, end: string, offset: number, anchor: string}[];
};

type DiagramProps = {
  width: number;
  height: number;
  data: Data;
  polarity: number;
  radius: number;
};

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const Timeline = ({ width, height, data, polarity=1, radius=16}: DiagramProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date(2024, 3, 15).getTime());
  const [isDragging, setIsDragging] = useState(false);
  const animationRef = useRef<number | null>(null);

  const yOffset = polarity===0?-radius:radius;
  const startDate = new Date(2024, 3, 15);
  const endDate = new Date(2025, 2, 15);

  const updatedNodes = data.nodes.map((node) => ({
    ...node,
    id: generateUniqueId(),
  }));

  const allNodeGroups = [...new Set(updatedNodes.map((node) => node.group))];
  const [ref, dms] = useChartDimensions(chartSettings);

  const xScale = useMemo(() => (
    scaleUtc()
    .domain([startDate, endDate])
    .nice()
    .range([0, dms.boundedWidth])
  ), [dms.boundedWidth]);

  const colorScale = scaleOrdinal<string>()
    .domain(allNodeGroups)
    .range(COLORS);

  const durationField = (date: Date, node: any) => {
    if (node.end === "") {
      return <></>;
    } else {
      const end = new Date(node.end);
      const width = xScale(end) - xScale(date);
      return (
        <rect
          key={"rect"+node.id}
          x={xScale(date)}
          y={dms.boundedHeight-radius/2}
          width={width}
          height={radius}
          fill={colorScale(node.group)}
        />
      );
    }
  };

  const allNodes = updatedNodes.map((node) => {  
    const date = new Date(node.date);
    const textY = dms.boundedHeight+2.5*-yOffset+0.5*radius+node.offset;
    if (date.getTime() > currentTime) return null; // Only display nodes up to the current time
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
          d={`M ${xScale(date)} ${node.offset<=0?textY+5:node.offset<=25?textY:textY-15} L ${xScale(date)} ${node.offset<=25?dms.boundedHeight-radius:dms.boundedHeight+radius}`} 
          stroke="black"
          strokeWidth="1"
        />
      </g>
    );
  });

  const legend_nodes = [...new Set(updatedNodes.map((node) => node.group))];
  const legend = legend_nodes.map((node, i) => {  
    return (
      <g key={i}>
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

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRewind = () => {
    setCurrentTime(startDate.getTime());
    setIsPlaying(true);
  };

  const handleRepeat = () => {
    setIsRepeating(!isRepeating);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
    setIsPlaying(false);
    document.body.classList.add('no-select');
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      const { clientX } = event;
      const { left } = ref.current.getBoundingClientRect();
      const xPos = clientX - left - dms.marginLeft;
      const newTime = xScale.invert(xPos).getTime();
      if (newTime >= startDate.getTime() && newTime <= endDate.getTime()) {
        setCurrentTime(newTime);
      }
    }
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const { clientX } = event;
    const { left } = ref.current.getBoundingClientRect();
    const xPos = clientX - left - dms.marginLeft;
    const newTime = xScale.invert(xPos).getTime();
    setIsPlaying(false);
    if (newTime >= startDate.getTime() && newTime <= endDate.getTime()) {
      setCurrentTime(newTime);
    }
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      setIsDragging(false);
      document.body.classList.remove('no-select');
    };

    const handleMouseMoveGlobal = (event: MouseEvent) => {
      handleMouseMove(event);
    };

    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
    };
  }, [isDragging]);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setCurrentTime(prevTime => {
          const newTime = prevTime + 21600000; // Increment by six hours
          if (newTime > endDate.getTime()) {
            if (isRepeating) {
              return startDate.getTime();
            } else {
              setIsPlaying(false);
              return prevTime;
            }
          }
          return newTime;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isRepeating]);

  return (
    <div className="Chart__wrapper" ref={ref} style={{ height: "200px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Button onClick={handlePlay}>
          <MdPlayArrow />
        </Button>
        <Button onClick={handleRewind} id="timeline-replay">
          <MdReplay />
        </Button>
        <Button onClick={handleRepeat} style={{ color: isRepeating ? '#2caa4a' : 'black' }}>
          <MdRepeat />
        </Button>
      </div>
      <svg id="timeline" width={dms.width} height={dms.height} onClick={handleSvgClick}>
        <g transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}>
          <g id="timeline-legend">{legend}</g>
          <g key={"node-links"} width={width} height={height}>
            {allNodes}
          </g>
          <g transform={`translate(${[0, dms.boundedHeight].join(",")})`}>
            <Axis
              domain={xScale.domain()}
              range={xScale.range()}
              xScale={xScale}
              radius={radius}
              numberOfTicksTarget={13}
            />
          </g>
          <circle
            cx={xScale(new Date(currentTime))}
            cy={dms.boundedHeight}
            r={5}
            fill="#2caa4a"
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            onMouseDown={handleMouseDown}
          />
        </g>
      </svg>
    </div>
  );
};

export default Timeline;