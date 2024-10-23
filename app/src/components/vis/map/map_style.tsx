
import { getFocusColour } from '../colours';

const getLegendColors = (scenario_layer: any) => {
    const legend = scenario_layer.legend;
    const range = scenario_layer.focus.range;   
    const polarity = scenario_layer.colour_scale_direction? scenario_layer.colour_scale_direction : 'positive';
    if (scenario_layer.legend.range_greq_le && range[0]>=0 && range[1]<0) {    const numGroups = legend.length;
        const step = (range[1] - range[0]) / numGroups;
        const colors = [];
    
        for (let i = 0; i <= numGroups; i++) {
            const value = range[0] + i * step;
            const color = getFocusColour(value, range, polarity);
            colors.push(value, color);
        }
        return colors;
    } else if (scenario_layer.legend.level && scenario_layer.legend.colour) {
        const colors = legend.reduce((acc: any[], item: any) => {
          acc.push(item.level, item.colour);
          return acc;
        }, {});
        return colors;
    } else {
        const colors = legend.reduce((acc: any[], item: any) => {
            if (range && range.length === 2) {
                const color = getFocusColour(item.range_greq_le[0], range, polarity);
                acc.push(item.range_greq_le[0], color);
            }
            return acc;
        }, []);

        if (polarity==='positive' && colors.length >= 2 && colors[colors.length - 2] !== range[1]) {
            colors.push(range[1], getFocusColour(range[1], range, polarity));
        } else if (polarity==='negative' && colors.length >= 2 && colors[colors.length - 2] !== range[0]) {
            colors.push(range[0], getFocusColour(range[0], range, polarity));
        }
        return colors;
    }
}

export const style_layer = (scenario_layer: any, layer: any) => {
    let type;
    let layout;
    let paint;
    let legendColors;
    switch (layer.style) {
        case "linkage-area-fill":
            paint = {
                "fill-outline-color": "#000",
                "fill-color": 
                    ['case',
                        ['boolean', ['feature-state', 'click'], false],
                        "#ffff66",
                        "#CCC"
                    ],
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0
                ]
            };
            type = 'fill';
            layout = {
            }
            break;
            case "linkage-area-line":
                paint = {
                    "line-color": "#000",
                    "line-width": 2,
                },
                type = 'line';
                layout = {
                }
                break;
        case "choropleth": 
            legendColors = getLegendColors(scenario_layer);
            if (layer.extrude) {
                type = "fill-extrusion";
                paint = {
                    "fill-extrusion-color": 
                        ['case',
                            ['boolean', ['feature-state', 'click'], false],
                            "#ffff66",
                            ["case", 
                                ["==", ["get", layer.focus.variable], null], 
                                "#FFF", 
                                ["interpolate", ["linear"], ["get", layer.focus.variable], ...legendColors],
                            ]
                        ],
                    "fill-extrusion-base": 0,
                    "fill-extrusion-opacity": 0.5,
                    "fill-extrusion-vertical-gradient": true,
                    'fill-extrusion-height': ['get', layer.extrude]
                }
                layout = {
                };
            } else {
                type = "fill";
                paint = {
                    "fill-color": 
                        ['case',
                            ['boolean', ['feature-state', 'click'], false],
                            "#ffff66",
                            ["case", 
                                ["==", ["get", layer.focus.variable], null], 
                                "#FFF", 
                                ["interpolate", ["linear"], ["get", layer.focus.variable], ...legendColors],
                            ]
                        ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        1,
                        0.5
                    ]
                };
                layout = {
                    "fill-sort-key": ["get",  layer.focus.variable]
                };
            }
            break;
        case "network": 
            legendColors = getLegendColors(scenario_layer);
            paint = {
                "line-offset": layer.style_options && layer.style_options["line-offset"] ? layer.style_options["line-offset"] : 0,
                "line-color": 
                ['case',
                    ['boolean', ['feature-state', 'click'], false],
                    "#ffff66",
                    ["case", ["==", ["get", layer.focus.variable], null], "#FFF",["interpolate", ["linear"], ["get", layer.focus.variable], ...legendColors]]
                ],
                "line-width": 
                    ["interpolate", ["exponential",2], ["zoom"], 5, 
                    ['case',
                        ['boolean', ['feature-state', 'click'], false],
                        10,2], 
                        18, 20],
                "line-blur": 2,
                "line-opacity": ["case", ["==", ["get", layer.focus.variable], null], 0.4,1]
            };
            type = "line"
            layout = {
                "line-cap": "round",
                "line-join": "round",
                "line-sort-key": ["get",  layer.focus.variable]
            }
            break;
        case "network-categorical":
            const colorMapping = layer.legend.reduce((acc: { [key: string]: string }, item: { level: string, colour: string }) => {
                acc[item.level] = item.colour;
                return acc;
              }, {});
            const getColorExpression = (variable: string) => {
                return [
                  'case',
                  ['boolean', ['feature-state', 'click'], false],
                  "#ffff66",
                  ["case",
                    ["==", ["get", variable], null], "#FFF",
                    ["match",
                      ["get", variable],
                      ...Object.entries(colorMapping).flat(),
                      "#FFF" // Default color if no match
                    ]
                  ]
                ];
              };
            paint = {
                "line-offset": layer.style_options && layer.style_options["line-offset"] ? layer.style_options["line-offset"] : 0,
                "line-color": getColorExpression(layer.focus.variable),
                "line-width": 
                    ["interpolate", ["exponential",2], ["zoom"], 5, 
                    ['case',
                        ['boolean', ['feature-state', 'click'], false],
                        10,2], 
                        18, 20],
                "line-blur": 2,
                "line-opacity": ["case", ["==", ["get", layer.focus.variable], null], 0.4,1]
            };
            type = "line"
            layout = {
                "line-cap": "round",
                "line-join": "round",
                "line-sort-key": ["get",  layer.focus.variable]
            }
            break;
        default:
            paint = {
                "fill-color": "#000000",
                "fill-opacity": 0.6
            };
            type = 'fill'
            layout = {}
            break;
    }
    const { style, options, ...restLayer } = layer;
    return {
        ...restLayer,
        paint,
        type,
        layout,
    }
}
