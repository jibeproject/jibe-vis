import { formatGraph } from '../graphs';
import { Dialog, Typography, DialogContent, DialogActions, Button } from '@mui/material';
import { createRoot } from 'react-dom/client';
import { DownloadChartAsPng } from '../graphs';

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
      const container = document.createElement('div');
      const root = createRoot(container);
      root.render(
        <GraphDialog
          feature={feature}
          scenario_layer={scenario_layer}
          open={true}
          onClose={() => {
            root.unmount();
          }}
        />
      );
      popupContent = container.innerHTML;
    }
    else if (popup_type === "linkage") {
      // console.log(feature.properties);
      popupContent = linkagePopup(feature, scenario_layer);
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
  feature: maplibregl.MapGeoJSONFeature;
  scenario_layer: any;
  open: boolean;
  onClose: () => void;
}

const GraphDialog = ({ feature, scenario_layer, open, onClose }: GraphDialogProps) => {
  const featureWithFocus = {
    ...feature,
    focus: {
      units: scenario_layer.focus.units
    }
  };
  const interactivePopup = formatGraph(featureWithFocus, scenario_layer);
  // const baseUrl = `${window.location.origin}${window.location.pathname}`;
  // const queryString = focusFeature ? `?${focusFeature.getQueryString()}` : '';
  // const shareUrl = `${baseUrl}${queryString}`;
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

function linkagePopup(feature: maplibregl.MapGeoJSONFeature, scenario_layer: any) {
  const name = feature.properties[scenario_layer.index.variable] || feature.properties[scenario_layer.index.unnamed];
  const popupContent = `
      <b>${name}</b><br/>
      <sub>Linkage area</sub>
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