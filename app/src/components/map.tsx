import { FC, useRef, useEffect, useState } from 'react';
import { IconType } from 'react-icons';
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
// import { MaplibreLegendControl } from "@watergis/maplibre-gl-legend";
// import '@watergis/maplibre-gl-legend/dist/maplibre-gl-legend.css';
// import { MdDirectionsWalk as PedestrianIcon } from "react-icons/md";
// import { MdDirectionsWalk as PedestrianIcon } from "react-icons/md";
// import { MdArrowRight } from "react-icons/md";

export function addMapIcon(name:string, icon:IconType, map:maplibregl.Map | null) {
  const img = new Image(32, 32);
  img.src = icon.toString(); // Convert the icon to a string
  if (map) {
    img.onload = () => map.addImage(name, img);
  }
};

// const Arrow = {/* <Img src={MdArrowRight}/> */}
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
const exportControl = new MaplibreExportControl({
  PageSize: Size.A3,
  PageOrientation: PageOrientation.Portrait,
  Format: Format.PNG,
  DPI: DPI[96],
  Crosshair: true,
  PrintableArea: true,
  Local: 'en',
  
});
interface MapProps {}
const filterGroup = document.getElementById('filter-group');
const Map: FC<MapProps> = (): JSX.Element => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng] = useState<number>(145.1072);
  const [lat] = useState<number>(-37.8189);
  const [zoom] = useState<number>(10);
   
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
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // // add MapLibre measures plugin (see options https://github.com/jdsantos/maplibre-gl-measures)
    // DISABLED: COULD NOT GET TO WORK WITH TYPESCRIPT 
    // map.current.addControl(new MeasuresControl({ /** see options below for further tunning */}), "top-left");
    
    // add MapLibre export plugin (export to pdf, png, jpeg, svg; https://maplibre-gl-export.water-gis.com/
    map.current.addControl(exportControl, 'top-right');

    // The 'building' layer in the streets vector source contains building-height
  // data from OpenStreetMap.
  map.current.on('load', async () => {
  // const layers = {
  //   'pedestrian_crossing': 'Pedestrian crossings',
  //   // 'cyc_cross': 'Bicycle crossings',
  // }
  // const img = new Image(32, 32); //create HTMLElement
  // img.src = 
  // Insert buildings layer beneath any symbol layer.
  // img.onload = () => map.current!.addImage("pedestrian", img); //when img is loaded, add it to the map
  const pedestrian = await map.current!.loadImage('https://upload.wikimedia.org/wikipedia/commons/7/78/Pedestrian_and_bike_zone_icon.png?20190524130248=&download=');
  map.current!.addImage('pedestrian', pedestrian.data);
  // }
  // const img = new Image(32, 32); //create HTMLElement
  // img.src = Arrow //set HTMLELement img src
  // Insert buildings layer beneath any symbol layer.
  // addMapIcon('arrow',MdArrowRight,map.current)
  // img.onload = () => map.current!.addImage("pedestrian", img); //when img is loaded, add it to the map
  if (map.current) {
    const layers = map.current.getStyle().layers;
    // create image icons
    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && (layers[i].layout as any)['text-field']) {
        labelLayerId = layers[i].id;
        break;
      }
    }
    map.current.addSource('nodes', {
      type: "vector",
      url: 'pmtiles://https://d1txe6hhqa9d2l.cloudfront.net/jibe_nodes.pmtiles',
      attribution:
        '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
    },);

    map.current.addLayer(
        {
            'id': 'pedestrian_crossing',
            'source': 'nodes',
            'source-layer': 'nodes',
            'type': 'symbol',
            'layout': {
                'icon-image': 'pedestrian',
                'icon-size': 0.05,
                // 'icon-overlap': 'always'
                // 'symbol-z-order': 'auto',
            },
            'filter': ['==', 'ped_cros', 'Car signal']
        },
        labelLayerId
     );
    map.current.addSource('network', {
      type: "vector",
      url: 'pmtiles://https://d1txe6hhqa9d2l.cloudfront.net/jibe_directional_network.pmtiles',
      attribution:
        '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
    },);
    map.current.addLayer(
        {
            'id': 'network',
            'source': 'network',
            'source-layer': 'network',
            'type': 'line',
            'layout': {
              'line-cap': 'round',
              'line-join': 'round',
            },
            // 'minzoom': 14,
            // paint: {
              //   'line-color': [
                //     [["==", ["feature-state", "direction"], "Urgent"],"red"],
                //     [["==", ["feature-state", "direction"], "Medium"],"yellow"],
                //     [["==", ["feature-state", "Need"], "Starting"],"green"]
                //   ],
                //   'line-width': 3,
                // }
            paint: {
                'line-opacity': 0.8,
                'line-color': [
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
              ],
                'line-blur': 4,
                'line-width': 6,
                // arrow line pattern
                // 'line-pattern':  'arrow',
                // 'line-width': {
                //     stops: [[8, 4], [18, 10]]
                // },
            //     'line-offset': ['interpolate', ['linear'], ['zoom'],
            //         8,
            //         ['case',
            //             ["==", ["get", "direction"], "out"],
            //             -2,
            //             ["==", ["get", "direction"], "rtn"],
            //             2,
            //             0
            //         ],
            //         18,
            //         ['case',
            //             ["==", ["get", "direction"], "out"],
            //             -6,
            //             ["==", ["get", "direction"], "rtn"],
            //             6,
            //             0
            //         ],
            //     ],
        
            }
        }
      )
    // Add checkbox and label elements for the layer.
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'pedestrian_crossing';
    input.checked = true;
    if (filterGroup) {
      filterGroup.appendChild(input);
    }

    const label = document.createElement('label');
    label.setAttribute('for', 'ped_cros');
    label.textContent = 'Pedestrian crossing';
    if (filterGroup) {
      filterGroup.appendChild(label);
    }

    // When the checkbox changes, update the visibility of the layer.
    input.addEventListener('change', (e) => {
        if (map.current && e.target) {
          const target = e.target as HTMLInputElement;
          map.current.setLayoutProperty(
            'pedestrian_crossing',
              'visibility',
              target.checked ? 'visible' : 'none'
          );
      }
    });
    
    //  map.addControl(new MapboxLegendControl({}, {reverseOrder: false}), 'bottom-left');
  }
});

  }, [lng, lat, zoom]);
  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

export default Map;