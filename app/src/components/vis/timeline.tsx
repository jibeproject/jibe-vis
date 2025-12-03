import { scaleUtc, scaleOrdinal } from "d3";
import { useChartDimensions } from './custom-hooks';
import { useMemo, useState, useEffect, useRef } from "react";
import { TimeAxis as Axis } from './axis';
import Pause from '@mui/icons-material/Pause';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Replay from '@mui/icons-material/Replay';
import Repeat from '@mui/icons-material/Repeat';
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
// react and d3 advice from https://2019.wattenberger.com/blog/react-and-d3
// horizontal arc diagram adapted from https://www.react-graph-gallery.com/arc-diagram
// import { downloadChartAsPng } from './graphs';

const COLORS = [ "#faccfa",  "#d29343",  "#011959", "#3c6d56"];
const chartSettings = {
  "marginTop": 20,
  "marginRight": 20,
  "marginLeft": 20,
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
  orientation?: 'horizontal' | 'vertical';
  title?: string;
};

type AnchorType = "start" | "middle" | "end" | "inherit";

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const Timeline = ({ width, height, data, polarity=1, radius=16, orientation = 'horizontal', title }: DiagramProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date(2024, 3, 15).getTime());
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [uniqueId, setUniqueId] = useState('');

  useEffect(() => {
      setUniqueId(generateUniqueId());
  }, []);

  const animationRef = useRef<number | null>(null);

  const yOffset = polarity===0?-radius:radius;
  const isVertical = orientation === 'vertical';
  const startDate = new Date(Math.min(...data.nodes.map(node => new Date(node.date).getTime())));
  const endDate = new Date(Math.max(...data.nodes.map(node => new Date(node.end || node.date).getTime())));

  const updatedNodes = data.nodes.map((node) => ({
    ...node,
    id: generateUniqueId(),
  }));

  const allNodeGroups = [...new Set(updatedNodes.map((node) => node.group))];
  const [ref, dms] = useChartDimensions(chartSettings);

  // Calculate a vertical content-driven height when vertical orientation is used.
  const nodeCount = updatedNodes.length;
  const minPerNode = Math.max(radius * 3, 28); // minimal vertical space per node
  const verticalHeightMultiplier = 1.5; // increase overall vertical height
  const verticalContentBase = Math.max(300, nodeCount * minPerNode);
  const verticalContentHeight = isVertical ? Math.round(verticalContentBase * verticalHeightMultiplier) : dms.boundedHeight;

  const timeScale = useMemo(() => (
    scaleUtc()
      .domain([startDate, endDate])
      .nice()
      .range(isVertical ? [0, verticalContentHeight] : [0, dms.boundedWidth])
  ), [dms.boundedWidth, dms.boundedHeight, isVertical, verticalContentHeight]);

  const colorScale = scaleOrdinal<string>()
    .domain(allNodeGroups)
    .range(COLORS);

  const durationField = (date: Date, node: any) => {
    if (node.end === "") {
      return <></>;
    } else {
      const end = new Date(node.end);
      const opacity = end.getTime() <= currentTime ? 1 : 0.4;
      if (!isVertical) {
        const width = timeScale(end) - timeScale(date);
        return (
          <rect
            key={"rect"+node.id}
            x={timeScale(date)}
            y={dms.boundedHeight-radius/2}
            width={width}
            height={radius}
            fill={colorScale(node.group)}
            opacity={opacity}
          />
        );
      } else {
        const height = timeScale(end) - timeScale(date);
        return (
          <rect
            key={"rect"+node.id}
            x={0}
            y={timeScale(date)}
            width={radius}
            height={height}
            fill={colorScale(node.group)}
            opacity={opacity}
          />
        );
      }
    }
  };

  const allNodes = updatedNodes.map((node) => {
    const date = new Date(node.date);
    const opacity = date.getTime() <= currentTime ? 1 : 0.4;
    if (!isVertical) {
      const textY = dms.boundedHeight+2.5*-yOffset+0.5*radius+node.offset;
      const validAnchors: AnchorType[] = ["start", "middle", "end", "inherit"];
      const anchorValue: AnchorType = validAnchors.includes(node.anchor as AnchorType)
        ? (node.anchor as AnchorType)
        : "middle";
      return (
        <g key={node.id} opacity={opacity}>
          <circle
            key={"circle"+node.id}
            cx={timeScale(date)}
            cy={dms.boundedHeight}
            r={radius}
            fill={colorScale(node.group)}
          />
          {durationField(date, node)}
          <text x={timeScale(date)} y={textY} textAnchor={anchorValue}>
            {node.label}
          </text>
          {node.label !== "" ? <path
            d={`M ${timeScale(date)} ${node.offset<=0?textY+5:node.offset<=25?textY:textY-15} L ${timeScale(date)} ${node.offset<=25?dms.boundedHeight-radius:dms.boundedHeight+radius}`} 
            stroke="black"
            strokeWidth="1"
          /> : ""}
        </g>
      );
    } else {
      // vertical layout: baseline at x=0, time increases downwards
  const cx = 0;
  const cy = timeScale(date);
  const textX = radius * 2;
  const textY = cy; // place label horizontally aligned with axis mark
      return (
        <g key={node.id} opacity={opacity}>
          <circle
            key={"circle"+node.id}
            cx={cx}
            cy={cy}
            r={radius}
            fill={colorScale(node.group)}
          />
          {durationField(date, node)}
          <text x={textX} y={textY} textAnchor={'start'} alignmentBaseline={'middle'}>
            {node.label}
          </text>
          {node.label !== "" ? <path
            d={`M ${cx} ${cy} L ${textX-4} ${cy}`}
            stroke="black"
            strokeWidth="1"
          /> : ""}
        </g>
      );
    }
  });

  const legend_nodes = [...new Set(updatedNodes.map((node) => node.group))];
  const legendSpacing = dms.boundedWidth >= 640 ? dms.boundedWidth / legend_nodes.length : radius * 3;
  const legend = legend_nodes.map((node, i) => {
    const x = dms.boundedWidth >= 640 ? i * legendSpacing : 0;
    const y = dms.boundedWidth >= 640 ? 0 : i * legendSpacing;
    return (
      <g key={i} transform={`translate(${x}, ${y})`}>
        <circle
          key={node}
          cx={0}
          cy={0}
          r={radius}
          fill={colorScale(node)}
        />
        <text x={radius * 1.5} y={radius * 0.5} textAnchor='start'>
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
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      if (!isVertical) {
        const { clientX } = event;
        const { left } = ref.current.getBoundingClientRect();
        const xPos = clientX - left - dms.marginLeft;
        const newTime = timeScale.invert(xPos).getTime();
        if (newTime >= startDate.getTime() && newTime <= endDate.getTime()) {
          setCurrentTime(newTime);
        }
      } else {
        const { clientY } = event;
        const { top } = ref.current.getBoundingClientRect();
        const yPos = clientY - top - dms.marginTop;
        const newTime = timeScale.invert(yPos).getTime();
        if (newTime >= startDate.getTime() && newTime <= endDate.getTime()) {
          setCurrentTime(newTime);
        }
      }
    }
  };


  const handleTouchStart = () => {
    setIsDragging(true);
    setIsPlaying(false);
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (isDragging) {
      if (!isVertical) {
        const { clientX } = event.touches[0];
        const { left } = ref.current.getBoundingClientRect();
        const xPos = clientX - left - dms.marginLeft;
        const newTime = timeScale.invert(xPos).getTime();
        if (newTime >= startDate.getTime() && newTime <= endDate.getTime()) {
          setCurrentTime(newTime);
        }
      } else {
        const { clientY } = event.touches[0];
        const { top } = ref.current.getBoundingClientRect();
        const yPos = clientY - top - dms.marginTop;
        const newTime = timeScale.invert(yPos).getTime();
        if (newTime >= startDate.getTime() && newTime <= endDate.getTime()) {
          setCurrentTime(newTime);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!isVertical) {
      const { clientX } = event;
      const { left } = ref.current.getBoundingClientRect();
      const xPos = clientX - left - dms.marginLeft;
      const newTime = timeScale.invert(xPos).getTime();
      if (newTime >= startDate.getTime() && newTime <= endDate.getTime()) {
        setCurrentTime(newTime);
      }
    } else {
      const { clientY } = event;
      const { top } = ref.current.getBoundingClientRect();
      const yPos = clientY - top - dms.marginTop;
      const newTime = timeScale.invert(yPos).getTime();
      if (newTime >= startDate.getTime() && newTime <= endDate.getTime()) {
        setCurrentTime(newTime);
      }
    }
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      setIsDragging(false);
    };

    const handleMouseMoveGlobal = (event: MouseEvent) => {
      handleMouseMove(event);
    };

    const handleTouchMoveGlobal = (event: TouchEvent) => {
      handleTouchMove(event);
    };

    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('touchmove', handleTouchMoveGlobal);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('touchmove', handleTouchMoveGlobal);
      window.removeEventListener('touchend', handleTouchEnd);
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

  // widen vertical plot and set wrapper dimensions when vertical
  const verticalWidthMultiplier = 2; // make vertical plot wider
  const verticalLabelBuffer = 88; // space on left for month and year labels
  const verticalWrapperWidth = isVertical ? Math.round(Math.max(dms.width * verticalWidthMultiplier + verticalLabelBuffer, 300)) : dms.width;
  const verticalWrapperHeight = isVertical ? verticalContentHeight + (dms.marginTop ?? chartSettings.marginTop) + 40 : null;

  // compute inner plotting width and center x for vertical mode
  const plotSvgWidth = isVertical ? verticalWrapperWidth : dms.width;
  const plotInnerWidth = plotSvgWidth - (dms.marginLeft + (isVertical ? verticalLabelBuffer : 0)) - dms.marginRight;
  const centerX = isVertical ? Math.round(plotInnerWidth / 2) : 0;

  return (
  <div className="Chart__wrapper no-select" ref={ref} style={{ width: isVertical ? `${verticalWrapperWidth}px` : undefined, height: isVertical ? `${verticalWrapperHeight}px` : (dms.boundedWidth>=640? "200px":`280px`) }}>
      <div style={{ marginBottom: "10px" }}>
            {title ? (
              <Typography variant="h6" gutterBottom style={{ marginBottom: 6 }}>
                {title}
              </Typography>
            ) : null}
        <Button onClick={handlePlay}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </Button>
        <Button onClick={handleRewind} id="timeline-replay">
          <Replay />
        </Button>
        <Button onClick={handleRepeat} style={{ color: isRepeating ? '#2caa4a' : 'black' }}>
          <Repeat />
        </Button>
        {/* <Button onClick={() => downloadChartAsPng(`timeline-container-${uniqueId}`)} color="primary">
            Download
        </Button> */}
      </div>
      <div id={`timeline-container-${uniqueId}`} style={{ height: '100%' }}>
      <svg 
        id="timeline" 
        width={isVertical ? verticalWrapperWidth : dms.width} 
        height={dms.height} 
        onClick={handleSvgClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
        >
  {/* apply extra left offset in vertical mode so labels aren't clipped */}
  <g transform={`translate(${[dms.marginLeft + (isVertical ? verticalLabelBuffer : 0), dms.marginTop].join(",")})`}>
          <g>{legend}</g>
          <g key={"node-links"} width={width} height={height}>
            {allNodes}
          </g>
          {!isVertical && (
            <g transform={`translate(${[0, dms.boundedHeight].join(",")})`}  style={{ strokeWidth: isHovered ? 3 : 1 }}>
              <Axis
                domain={[startDate, endDate]}
                range={timeScale.range() as [number, number]}
                xScale={timeScale}
                radius={radius}
                numberOfTicksTarget={13}
              />
            </g>
          )}
          {isVertical && (
            // simple vertical axis: ticks and labels along x=0, labels to the left
            <g className="vertical-axis" style={{ strokeWidth: isHovered ? 3 : 1 }}>
              {
                (() => {
                  const tickTarget = 10;
                  // timeScale.ticks should be available on scaleUtc
                  const rawTicks: Date[] = (timeScale as any).ticks ? (timeScale as any).ticks(tickTarget) : [];
                  // Build a filtered list of ticks: always include the start date,
                  // include ticks where the month changes compared to previous included tick,
                  // and always include January (month === 0) ticks.
                  const filtered: Date[] = [];
                  let lastMonth: number | null = null;
                  // ensure startDate included
                  filtered.push(new Date(startDate));
                  lastMonth = startDate.getMonth();
                  for (const t of rawTicks) {
                    const m = t.getMonth();
                    if (t.getTime() === startDate.getTime()) continue;
                    if (m !== lastMonth || m === 0) {
                      filtered.push(t);
                      lastMonth = m;
                    }
                  }
                  // ensure end is included
                  if (filtered.length === 0 || filtered[filtered.length - 1].getTime() !== endDate.getTime()) {
                    filtered.push(new Date(endDate));
                  }

                  const formatMonth = (d: Date) => d.toLocaleDateString([], { month: 'short' });
                  return filtered.map((t, i) => {
                    const y = timeScale(t);
                    return (
                      <g key={i} transform={`translate(0, ${y})`}>
                        {/* draw a short tick only for year (start and January) */}
                        {(i === 0 || t.getMonth() === 0) && (
                          <>
                            <text x={-verticalLabelBuffer + 12} y={0} textAnchor="end" alignmentBaseline="middle" style={{ fontSize: 11, fontWeight: 600 }}>
                              {t.getFullYear()}
                            </text>
                          </>
                        )}
                        {/* months: place halfway between year and plot (no tick line) */}
                        <text x={Math.round((-verticalLabelBuffer + 12) / 2)} y={0} textAnchor="end" alignmentBaseline="middle" style={{ fontSize: 11 }}>
                          {formatMonth(t)}
                        </text>
                      </g>
                    );
                  });
                })()
              }
            </g>
          )}
          {!isVertical ? (
            <circle
              cx={timeScale(new Date(currentTime))}
              cy={dms.boundedHeight}
              r={isHovered ? 8 : 5}
              fill="#2caa4a"
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            />
          ) : (
            <circle
              cx={0}
              cy={timeScale(new Date(currentTime))}
              r={isHovered ? 8 : 5}
              fill="#2caa4a"
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            />
          )}
        </g>
      </svg>
      </div>
    </div>
  );
};

export default Timeline;