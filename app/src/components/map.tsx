import { FC, useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as pmtiles from "pmtiles";
import layers from "protomaps-themes-base";
import './map.css';
import {
  MaplibreExportControl,
  Size,
  PageOrientation,
  Format,
  DPI
} from '@watergis/maplibre-gl-export';
import '@watergis/maplibre-gl-export/dist/maplibre-gl-export.css';
import {Flex} from '@aws-amplify/ui-react'
import { indicators, BasicTable } from './indicator_summary';
import { MdInfo, MdQuestionMark} from 'react-icons/md';


const protocol = new pmtiles.Protocol();

function toggleSidebar(id:string) {
  const elem = document.getElementById(id);
  if (elem) {
    const classes = elem.className.split(' ');
    const collapsed = classes.indexOf('collapsed') !== -1;

    const padding: { [key: string]: any }  = {};

    if (collapsed) {
        // Remove the 'collapsed' class from the class list of the element, this sets it back to the expanded state.
        classes.splice(classes.indexOf('collapsed'), 1);

        padding[id] = 420; // In px, matches the width of the sidebar set in .sidebar CSS class
    } else {
        padding[id] = 0;
        // Add the 'collapsed' class to the class list of the element
        classes.push('collapsed');
    }

    // Update the class list on the element
      elem.className = classes.join(' ');
  }
}

maplibregl.addProtocol("pmtiles", protocol.tile);
const exportControl = new MaplibreExportControl({
  PageSize: Size.A3,
  PageOrientation: PageOrientation.Landscape,
  Format: Format.PNG,
  DPI: DPI[96],
  Crosshair: true,
  PrintableArea: true,
  Local: 'en',
  
});
interface MapProps {}
// const filterGroup = document.getElementById('filter-group');
const Map: FC<MapProps> = (): JSX.Element => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng] = useState<number>(145.1072);
  const [lat] = useState<number>(-37.8189);
  const [zoom] = useState<number>(10);
  // Melbourne bbox
  const bounds = new maplibregl.LngLatBounds(
    [144.2204664161363041,-38.5928939112919238],
    [145.9919140905335553,-37.0850150826361826]
  );
   
  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: {
        version: 8,
        glyphs: "https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf",
        sources: {
          protomaps: {
            type: "vector",
            url: 'pmtiles://https://d1txe6hhqa9d2l.cloudfront.net/jibe_study_region.pmtiles',
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
          },
        },
        layers: layers("protomaps", "grayscale"),
      },
      center: [lng, lat],
      zoom: zoom,
      maxBounds: bounds,
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    // add MapLibre export plugin (export to pdf, png, jpeg, svg; https://maplibre-gl-export.water-gis.com/
    map.current.addControl(exportControl, 'top-right');
    // map.current.on("mouseenter", 'network_out', () => {
    //   map.current!.getCanvas().style.cursor = "crosshair";
    // });
    map.current.on('click', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point,{layers: ['network_out',
          'network_rtn']}
        )

        // Limit the number of properties we're displaying for
        // legibility and performance
        const displayProperties = [
          'layer',
          'properties',
        ];

        const displayFeatures = features.map((feat: maplibregl.MapGeoJSONFeature) => {
          const displayFeat: { [key: string]: any[] } = {};
          displayProperties.forEach((prop) => {
            displayFeat[prop] = [feat[prop as keyof maplibregl.MapGeoJSONFeature]];
          });
          return displayFeat;
        });

        const featureCheck = document.getElementById('features');
        if (featureCheck && displayFeatures.length > 0 && 'layer' in displayFeatures[0]) {
          // initialise displayProperties as a JSON object
          let displayProperties: { [key: string]: any } = {};
          Object.keys(indicators).forEach(element => {
            displayProperties[indicators[element]] = displayFeatures[0]['properties'][0][element as keyof typeof displayFeatures[0]['properties']];
          });
          // console.log(displayProperties);
          const layer_id = displayFeatures[0]['layer'][0]['id'];
          const return_variables = [
            "RTN_cycleTime",
            "RTN_walkTime",
            "RTN_bikeStressDiscrete",
            "RTN_bikeStress",
            "RTN_walkStress",
            "RTN_LTS"
            ]
          if (layer_id === 'network_rtn') {
            return_variables.forEach((variable) => {
              const replacement: string = variable.replace('RTN_', '');
              displayProperties[indicators[replacement]] = displayFeatures[0]['properties'][0][variable as keyof typeof displayFeatures[0]['properties']];
            });
          }
          // console.log(displayFeatures[0]['layer'][0]['id']);
          // const content: string = JSON.stringify(
          //   displayProperties,
          //   null,
          //   2
          // );
          featureCheck.innerHTML = BasicTable(displayProperties);
      };
    });
    // let hoveredStateId: number | null = null;

    map.current.on('load', async () => {
      toggleSidebar('left');
      const layers = map.current!.getStyle().layers;
      // create image icons
      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && (layers[i].layout as any)['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }
      // Add a layer for the network.
      map.current!.addSource('network', {
        type: "vector",
        url: 'pmtiles://https://d1txe6hhqa9d2l.cloudfront.net/jibe_directional_network.pmtiles',
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        promoteId:'fid',
      },);
      map.current!.addLayer(
        {
          'id': 'network_out',
          'source': 'network',
          'source-layer': 'network',
          'type': 'line',
          'layout': {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
              'line-opacity': 0.8,
              'line-offset': [
                'interpolate', ['linear'], ['zoom'],
              8,
              2,
              18,
              3,
          ],
          'line-color': [
              // 'case',
              // ['boolean', ['feature-state', 'hover'], false],
              // "#FFEA00",
              // [
                "match",
                ["get", "LTS"],
                1,
                "#011959",
                2,
                "#3c6d56",
                3,
                "#d29343",
                4,
                "#faccfa",
                "#CCC"
            //  ]
            ],
              'line-blur': 2,
              "line-width": [
                  "interpolate",
                  ['exponential', 2],
                  ['zoom'],
                  5,3,
                  20,10
              ]
        }    
      },
      labelLayerId
    );
    map.current!.addLayer(
      {
        'id': 'network_rtn',
        'source': 'network',
        'source-layer': 'network',
        'type': 'line',
        'layout': {
          'line-cap': 'round',
          'line-join': 'round',
        },
        'minzoom': 14,
        paint: {
            'line-opacity': 0.8,
            'line-offset': [
              'interpolate', ['linear'], ['zoom'],
            8,
            -2,
            18,
            -3,
        ],
        'line-color': [
            // 'case',
            // ['boolean', ['feature-state', 'hover'], false],
            // "#FFEA00",
            // [
              "match",
              ["get", "RTN_LTS"],
              1,
              "#011959",
              2,
              "#3c6d56",
              3,
              "#d29343",
              4,
              "#faccfa",
              "#CCC"
          //  ]
          ],
            'line-blur': 2,
            "line-width": [
                "interpolate",
                ['exponential', 2],
                ['zoom'],
                5,3,
                20,10
            ]
      }    
    }, 
    labelLayerId  
  );

  // Create a popup, but don't add it to the map yet.
  const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true
  });
  map.current!.on('click', 'network_out', function(e) {
    if (e.features && e.features.length > 0) {
      // console.log(e.features);
      const direction = "outbound";
      formatPopup(e, map, popup, direction);
    }
  });
  map.current!.on('click', 'network_rtn', function(e) {
    if (e.features && e.features.length > 0) {
      // console.log(e.features);
      const direction = "inbound";
      formatPopup(e, map, popup, direction);
    }
  });

//   // When the user moves their mouse over the state-fill layer, we'll update the
//   // feature state for the feature under the mouse.
//   map.current!.on('mousemove', 'network_out', (e) => {
//       if (e && e.features && e.features.length > 0) {
//           if (hoveredStateId) {
//               map.current!.setFeatureState(
//                   {source: 'network', sourceLayer: 'network_out', id: hoveredStateId},
//                   {hover: false}
//               );
//           }
//           if (e.features[0].id) {
//             hoveredStateId = e.features[0].id as number;
//             map.current!.setFeatureState(
//                 {source: 'network', sourceLayer: 'network_out', id: hoveredStateId},
//                 {hover: true}
//             );
//           }
//       }
//   });

//   // When the mouse leaves the state-fill layer, update the feature state of the
//   // previously hovered feature.
//   map.current!.on('mouseleave', 'network_out', () => {
//       if (hoveredStateId) {
//         map.current!.setFeatureState(
//               {source: 'network', sourceLayer: 'network_out', id: hoveredStateId},
//               {hover: false}
//           );
//       }
//       hoveredStateId = null;
//   });
});

  }, [lng, lat, zoom]);
  return (
    <div className="map-wrap">
      <Flex>
      <div ref={mapContainer} className="map" />
        <div id="left" className="sidebar flex-center left collapsed">
            <div className="sidebar-content rounded-rect flex-center">
                <div id="legend">
                <details>
                  <summary>
                    <h2 id="indicator-heading">Level of traffic stress
                      <MdQuestionMark className="question" title="Find out more"/>
                    {/* <div className="details-modal-overlay"></div> */}
                    </h2>
                  </summary>
                  <div className="details-modal">
                    <div className="details-modal-content">
                      <p>Level of Traffic Stress (LTS) for cycling along discrete road segments has been measured specifically for the Victorian policy context. The classification ranges from 1 (lowest stress, for use by all cyclists) to 4 (most stressful, and least suitable for safe cycling).  Our implementation of this measure draws on research developed at RMIT by Dr Afshin Jafari (<a href="https://www.linkedin.com/posts/jafshin_prevention-research-cycling-activity-7100370534600753152-qSsF" target='_blank'>read more</a>).</p>
                      <p>Multiple variables may contribute to comfort or stress when cycling, including traffic intensity, intersection design, and presence of seperated bike paths.  However, environmental aspects such as greenery and shade are also factors influencing cycling choices.</p>
                    </div>
                  </div>
                </details>
                <div id="indicator-content">
                  <div id="directions" title="How to use this map"> Select a road segment to view a range of metrics related to suitability for walking and cycling.</div>
                  <div id="lts-legend">
                    <div id="lts-legend-row">
                      <div id="lts-1" title="lowest stress, for use by all cyclists"><p>1</p><p>low</p></div>
                      <div id="lts-2">2</div>
                      <div id="lts-3">3</div>
                      <div id="lts-4" title="most stressful, and least suitable for safe cycling"><p>4</p><p>high</p></div>
                    </div>
                  </div>
                  <pre id="features">    
                  </pre>
                </div>
                </div>
            </div>
        </div>
        <div
          className="sidebar-toggle left"
          onClick={() => toggleSidebar('left')}
          title="Show or hide the map legend and indicator summary"
        >
          <MdInfo id="info_button"/>
        </div>
        <div className="sidebar-toggle left" onClick={() => toggleSidebar('left')} title="Show or hide the map legend and indicator summary">
          <MdInfo id="info_button"/>
        </div>
      </Flex>
    </div>
  );
}

export default Map;

function formatPopup(e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] | undefined; } & Object, map: React.MutableRefObject<maplibregl.Map | null>, popup: maplibregl.Popup, direction: string) {
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

