import { formatGraph } from '../graphs';
import { Dialog, Typography, DialogContent, DialogActions, Button } from '@mui/material';
import { createRoot } from 'react-dom/client';
import { DownloadChartAsPng } from '../graphs';
import './popup_info.css';
import axios from 'axios';

const queryJibeParquet = async (areaCodeName:string, areaCodeValue:string) => {
    const url = 'https://d1txe6hhqa9d2l.cloudfront.net/query/';
    const data = {
      key: areaCodeName,
      value: areaCodeValue
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error invoking Lambda function:', error);
    }
};


export default function formatPopup(feature: maplibregl.MapGeoJSONFeature, lngLat: maplibregl.LngLatLike, map: React.MutableRefObject<maplibregl.Map | null>, popup: maplibregl.Popup, layerId: string, scenario_layer: any) {
  const popup_type = scenario_layer.popup;
  if (feature && popup_type !== "none") {
    map.current!.getCanvas().style.cursor = 'pointer';
    let popupContent = '<div></div>';
    if (popup_type === "LTS") {
      popupContent = LTS(feature, map, layerId);
      popup.setLngLat(lngLat).setHTML(popupContent).addTo(map.current!);
    }
    else if (popup_type === "graph") {   
      console.log(feature.properties); 
      const container = modalPopup('graph', feature, scenario_layer);
      popupContent = container.innerHTML;
    }
    else if (popup_type === "linkage") {
      // console.log(feature.properties);
      popupContent = linkagePopup(feature, scenario_layer);
      popup.setLngLat(lngLat).setHTML(popupContent).addTo(map.current!);
    }
    else if (popup_type === "scenarioCategorical") {
      popupContent = scenarioCategoricalPopup(feature, scenario_layer);
      popup.setLngLat(lngLat).setHTML(popupContent).addTo(map.current!);
    }
    else if (popup_type === "none") {
      popupContent = '';
    }
    else {
      popupContent = defaultPopup(feature, scenario_layer);
      popup.setLngLat(lngLat).setHTML(popupContent).addTo(map.current!);
    }
  }
}

interface GraphDialogProps {
  modalPopupType: string;
  feature: maplibregl.MapGeoJSONFeature;
  scenario_layer: any;
  open: boolean;
  onClose: () => void;
}

const GraphDialog = ({modalPopupType, feature, scenario_layer, open, onClose }: GraphDialogProps) => {
  let featureWithFocus;
  let interactivePopup;
  if (modalPopupType === 'graph') {
    featureWithFocus = {
      ...feature,
      focus: {
        units: scenario_layer.focus.units
      }
    };
    interactivePopup = formatGraph(featureWithFocus, scenario_layer);
  } else if (modalPopupType === 'parquet') {
    interactivePopup = `Placeholder for variable retrieval from external parquet using linkage ID ${feature.properties[scenario_layer.index.variable]}`;
  } else {
    return null;
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
      <div id="chart-container">
        <Typography variant="h5">{scenario_layer.index.prefix+': '+feature.properties[scenario_layer.index.variable]}  
        </Typography>
        <Typography variant="h6">{scenario_layer.focus.selection_description}</Typography>
        {interactivePopup}
        <Typography>{ }</Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <DownloadChartAsPng elementId="chart-container" />
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function modalPopup(modalPopupType: string, feature: maplibregl.MapGeoJSONFeature, scenario_layer: any) {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(
    <GraphDialog
      modalPopupType={modalPopupType}
      feature={feature}
      scenario_layer={scenario_layer}
      open={true}
      onClose={() => {
        root.unmount();
      } } />
  );
  return container;
}

function linkagePopup(feature: maplibregl.MapGeoJSONFeature, scenario_layer: any) {
  const name = feature.properties[scenario_layer.index.variable] || feature.properties[scenario_layer.index.unnamed];
  const key = scenario_layer.index.variable
  const value = feature.properties[scenario_layer.index.variable];
  const content = queryJibeParquet(key,value);
  console.log(content);
  const popupContent = `
      <b>${name}</b><br/>
      <sub>Interactive graph using linkage query with external parquet data to go here.</sub>
      <p>${content}</p>
      `;
  return popupContent;
}

function defaultPopup(feature: maplibregl.MapGeoJSONFeature, scenario_layer: any) {
    const selectedVariable = (document.getElementById('variable-select') as HTMLSelectElement).value;
    const heading = selectedVariable ? 
      scenario_layer.dictionary[selectedVariable]: 
      scenario_layer.dictionary[scenario_layer.focus.variable];
    const info = selectedVariable ? 
      feature.properties[selectedVariable] : 
      feature.properties[scenario_layer.focus.variable];
    const roundedInfo = typeof info === 'number' ? info.toFixed(2) : info;
    const popupContent = `
      <b>${scenario_layer.index.prefix+': '+feature.properties[scenario_layer.index.variable]}</b><br>
      <sub>${heading}</sub>
      <sub>${roundedInfo}</sub>
      `;
    return popupContent;
    }


    function scenarioCategoricalPopup(feature: maplibregl.MapGeoJSONFeature, scenario_layer: any) {
      const name = feature.properties[scenario_layer.index.variable] || feature.properties[scenario_layer.index.unnamed];
      const reference = feature.properties[scenario_layer.focus.reference];
      const scenario = feature.properties[scenario_layer.focus.scenario];
      const reference_color = scenario_layer.legend.find((item: any) => item.level === reference)?.colour;
      const scenario_color = scenario_layer.legend.find((item: any) => item.level === scenario)?.colour;
      const reference_definition = scenario_layer.focus.reference_description
      const scenario_definition = scenario_layer.focus.scenario_description
      const reference_box = `
      <div id="scenario-popup-box-wrapper">
        <div>
            <b>Reference</b>
        </div>
        <div id="scenario-popup-box" style="background-color: ${reference_color};">
          <p>${reference}</p>
        </div>
        <div id="scenario-popup-box-definition">
        ${reference_definition}
        </div>
      </div>
    `;
    const scenario_box = `
      <div id="scenario-popup-box-wrapper">
        <div>
            <b>Scenario</b>
        </div>
        <div id="scenario-popup-box" style="background-color: ${scenario_color};">
          <p>${scenario}</p>
        </div>
        <div id="scenario-popup-box-definition">
        ${scenario_definition}
        </div>
      </div>
    `;
      const popupContent = `
          <b>${name}</b><br/>
          <div id="scenario-popup-box-definition"><b>${scenario_layer.focus.units}</b></div>
          <div style="display: flex; justify-content: space-between;">
          ${reference_box}
          <div style="border-left:1px solid #000;height:200px"></div>
          ${scenario_box}
          </div>
          <div id="scenario-popup-directions">${scenario_layer.focus.scenario_directions}</div>
        `;
    
    return popupContent;
  }

function LTS(feature: maplibregl.MapGeoJSONFeature, map: React.MutableRefObject<maplibregl.Map | null>, layerId: string) {
      const directions: { [key: string]: string } = {
        "network_out":"outbound",
        "network_rtn":"inbound",
      }
      let direction = directions[layerId]
      const name = feature.properties.name || 'Unnamed route';
      const zoom = map.current!.getZoom();
      let lts; // Declare the 'lts' variable
      if (direction === "outbound") {
        lts = feature.properties.LTS; // Assign a value to 'lts'
        if (zoom < 14) {
          const zoom_advice = "; Zoom in to view inbound LTS";
          direction = direction + zoom_advice;
        }
      } else {
        lts = feature.properties.RTN_LTS; // Assign a value to 'lts'
      }
      const color = get_LTS_color(lts);
      let definition = get_LTS_definition(lts);
      const UK_BikeStress = feature.properties.bikeStressDiscrete;
      const bikeStress_colour = get_bikeStress_colour(UK_BikeStress);
      let UK_definition = `UK classification rating:<br/>${UK_BikeStress}.`;
      if (UK_BikeStress === "null") {
        UK_definition = 'This road was excluded from the UK classification analysis.';
      }
      const UK_BikeStress_box = `<div id=LTS-popup-box-wrapper><div id="LTS-popup-box" style="background-color: ${bikeStress_colour};"><p></p></div>${UK_definition}</div>`
      const popupContent = `
          <b>${name}</b><br/>
          <sub id="direction">${direction}</sub>
          <div id=LTS-popup-box-wrapper>
          <div id="LTS-popup-box" style="background-color: ${color};">
          <p>${lts == null ? "" : "LTS "+lts}</p>
          </div>
          ${definition}
          </div>
          <hr class="solid">
          ${UK_BikeStress_box}
          <sub style="font-style:italic">Reference links to be provided in a future update.</sub>
          `;
    
    return popupContent;
  }
  
  function get_LTS_color(lts: any) {
    const levels = {
      1:"#011959",
      2:"#3c6d56",
      3:"#d29343",
      4:"#faccfa",
    };
    if (lts in levels) {
      return levels[lts as keyof typeof levels];
    } else {
      return "#CCC"
    };
  }
  
  function get_bikeStress_colour(bikeStressDiscrete: string) {
    const levels = {
      "GREEN":"#3c6d56",
      "AMBER":"#d29343",
      "RED":"red",
    };
    if (bikeStressDiscrete in levels) {
      return levels[bikeStressDiscrete as keyof typeof levels];
    } else {
      return "#CCC"
    };
  }
  
  function get_LTS_definition(lts: any) {
    const levels = {
      1:"Low stress, for use by all cyclists",
      2:"Moderately low stress",
      3:"Moderately high stress",
      4:"High stress, least suitable for safe cycling",
    };
    if (lts in levels) {
      return levels[lts as keyof typeof levels].toString()+' according to the Victorian LTS classification.';
    } else {
      return "Undefined (No value recorded)."
    };
  }
