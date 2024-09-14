import getFocusColour from "../colours"

const getLegendColors = (legend: any, range: [number,number]) => {

    return legend.reduce((acc: any[], item: any) => {
        if (range && range.length==2){
            const color = getFocusColour(item.range_greq_le[0], range);
            acc.push(item.range_greq_le[0], color);
            // console.log(acc)
            return acc;
        }
    }, []);
}

export const style_layer = (scenario_settings: any, layer: any) => {
    const legendColors = getLegendColors(scenario_settings.legend, scenario_settings.focus.range);
    let type;
    let layout;
    let paint;
    switch (layer.style) {
        case "choropleth": 
            paint = {
                "fill-color": ["interpolate", ["linear"], ["get", scenario_settings.focus.variable], ...legendColors],
                "fill-opacity": 0.6
            };
            type = "fill"
            layout = {}
            break;
        case "network": 
            paint = {
                "line-offset": layer.style_options && layer.style_options["line-offset"] ? layer.style_options["line-offset"] : 0,
                "line-color": ["interpolate", ["linear"], ["get", scenario_settings.focus.variable], ...legendColors],
                "line-width": ["interpolate", ["exponential", 2], ["zoom"], 5, 3, 20, 10],
                "line-blur": 2,
                "line-opacity": 0.8,
            };
            type = "line"
            layout = {
                "line-cap": "round",
                "line-join": "round"
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
