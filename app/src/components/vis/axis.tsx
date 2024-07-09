import { scaleLinear, scaleUtc } from "d3";
import { useMemo } from "react"

export const NumericAxis = ({
    domain=[0, 100],
    range=[10, 290],
    xScale= scaleLinear()
    .domain(domain)
    .range(range)
  }) => {
    const ticks = useMemo(() => {
      const width = range[1] - range[0]
      const pixelsPerTick = 30
      const numberOfTicksTarget = Math.max(
        1,
        Math.floor(
          width / pixelsPerTick
        )
      )
      return xScale.ticks(numberOfTicksTarget)
        .map(value => ({
          value,
          xOffset: xScale(value)
        }))
    }, [
      domain.join("-"),
      range.join("-")
    ])
    return (
      <svg>
        <path
          d={[
            "M", range[0], 6,
            "v", -6,
            "H", range[1],
            "v", 6,
          ].join(" ")}
          fill="none"
          stroke="currentColor"
        />
        {ticks.map(({ value, xOffset},i) => (
          <g
            key={`ticks-${i}`}
            transform={`translate(${xOffset}, 0)`}
          >
            <line
              y2="6"
              stroke="currentColor"
            />
            <text
              style={{
                fontSize: "10px",
                textAnchor: "middle",
                transform: "translateY(20px)"
              }}>
              { value }
            </text>
          </g>
        ))}
      </svg>
    )
  }



  export const TimeAxis = ({
    domain=[new Date(2024,4,1), new Date(2025,4,30)],
    range=[10, 290],
    xScale= scaleUtc()
    .domain(domain)
    .nice()
    .range(range),
    radius=16,
    numberOfTicksTarget=-1
  }) => {
    const ticks = useMemo(() => {
      const width = range[1] - range[0]
      const pixelsPerTick = 30
      if (numberOfTicksTarget===-1) {
        numberOfTicksTarget = Math.max(
          1,
          Math.floor(
            width / pixelsPerTick
          )
        )
      }
      return xScale.ticks(numberOfTicksTarget)
        .map(value => ({
          value,
          xOffset: xScale(value)
        }))
    }, [
      domain.join("-"),
      range.join("-")
    ])
    return (
      <svg>
        <path
          d={[
            "M", range[0], 6,
            "v", -6,
            "H", range[1],
            "v", 6,
          ].join(" ")}
          fill="none"
          stroke="currentColor"
        />
        {ticks.map(({ value, xOffset},i) => (
          <g
            key={`ticks-${i}`}
            transform={`translate(${xOffset}, 0)`}
          >
            <line
              y2="6"
              stroke="currentColor"
            />
            <text
              style={{
                fontSize: "10px",
                textAnchor: i===0?"start":"middle",
                transform: `translateY(${20+0.5*radius}px)`
              }}>
              {value.toLocaleDateString('en-us', {month:"short"})}
            </text>
            <text
              style={{
                fontSize: "10px",
                textAnchor: i===0?"start":"middle",
                transform: `translateY(${35+0.5*radius}px)`
              }}>
              {value.getMonth()===3?value.toLocaleDateString('en-us', { year:"numeric"}):""}
            </text>
          </g>
        ))}
      </svg>
    )
  }

  export default TimeAxis;