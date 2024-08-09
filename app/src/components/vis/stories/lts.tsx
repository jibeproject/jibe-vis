export default function formatPopup(e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] | undefined; } & Object, map: React.MutableRefObject<maplibregl.Map | null>, popup: maplibregl.Popup, layerId: string) {
    const directions: { [key: string]: string } = {
      "network_out":"outbound",
      "network_rtn":"inbound",
    }
    let direction = directions[layerId]
    if (e.features) {
      const name = e.features[0].properties.name || 'Unnamed route';
      map.current!.getCanvas().style.cursor = 'pointer';
      const zoom = map.current!.getZoom();
      let lts; // Declare the 'lts' variable
      if (direction === "outbound") {
        lts = e.features[0].properties.LTS; // Assign a value to 'lts'
        if (zoom < 14) {
          const zoom_advice = "; Zoom in to view inbound LTS";
          direction = direction + zoom_advice;
        }
      } else {
        lts = e.features[0].properties.RTN_LTS; // Assign a value to 'lts'
      }
      const color = get_LTS_color(lts);
      let definition = get_LTS_definition(lts);
      const UK_BikeStress = e.features[0].properties.bikeStressDiscrete;
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
          <p>LTS ${lts}</p>
          </div>
          ${definition}
          </div>
          <hr class="solid">
          ${UK_BikeStress_box}
          <sub style="font-style:italic">Reference links to be provided in a future update.</sub>
          `;
      popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map.current!);
    }
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
      return "#CCC"
    };
  }
  
  