import getFocusColour from "../colours"

const getLegendColors = (legend: any, range: [number, number]) => {
    const colors = legend.reduce((acc: any[], item: any) => {
        if (range && range.length === 2) {
            const color = getFocusColour(item.range_greq_le[0], range);
            acc.push(item.range_greq_le[0], color);
        }
        return acc;
    }, []);

    if (colors.length >= 2 && colors[colors.length - 2] !== range[1]) {
        colors.push(range[1], getFocusColour(range[1], range));
    }
    console.log(colors);
    return colors;
}

export const style_layer = (scenario_layer: any, layer: any) => {
    const legendColors = getLegendColors(scenario_layer.legend, scenario_layer.focus.range);
    let type;
    let layout;
    let paint;
    switch (layer.style) {
        case "choropleth": 
            paint = {
                "fill-color": 
                    ["case", ["==", ["get", layer.focus.variable], null], "#FFF", 
                    ["interpolate", ["linear"], ["get", layer.focus.variable], ...legendColors]],
                "fill-opacity": 0.6
            };
            type = "fill"
            layout = {
                "fill-sort-key": ["get",  layer.focus.variable]
            }
            break;
        case "network": 
            paint = {
                "line-offset": layer.style_options && layer.style_options["line-offset"] ? layer.style_options["line-offset"] : 0,
                "line-color": ["case", ["==", ["get", layer.focus.variable], null], "#FFF",["interpolate", ["linear"], ["get", layer.focus.variable], ...legendColors]],
                "line-width": ["interpolate", ["exponential",2], ["zoom"], 5, 1, 18, 20],
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
