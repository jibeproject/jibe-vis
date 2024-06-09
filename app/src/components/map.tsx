import { FC, useRef, useEffect, useState } from 'react';
// import { IconType } from 'react-icons';
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
// import { SvgManager } from "maplibre-gl-svg";
// import { MaplibreLegendControl } from "@watergis/maplibre-gl-legend";
// import '@watergis/maplibre-gl-legend/dist/maplibre-gl-legend.css';
// import { MdDirectionsWalk as PedestrianIcon } from "react-icons/md";
// import { MdDirectionsWalk as PedestrianIcon } from "react-icons/md";
// import { MdArrowRight } from "react-icons/md";

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
// const filterGroup = document.getElementById('filter-group');
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
    // add MapLibre export plugin (export to pdf, png, jpeg, svg; https://maplibre-gl-export.water-gis.com/
    map.current.addControl(exportControl, 'top-right');

    map.current.on('load', async () => {
      // interface LayerList {
      //   [key: string]: string;
      // }
      // const layer_list: LayerList = {
      //   network: 'Network',
      //   pedestrian_crossing: 'Pedestrian Crossing',
      //   // 'cyc_cross': 'Bicycle crossings',
      // };
      // const pedestrian = await map.current!.loadImage('https://upload.wikimedia.org/wikipedia/commons/7/78/Pedestrian_and_bike_zone_icon.png');
      // map.current!.addImage('pedestrian', pedestrian.data);
      // const arrow = await map.current!.loadImage('https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/TriangleArrow-Up.svg/277px-TriangleArrow-Up.svg.png');
      // map.current!.addImage('arrow', arrow.data);
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
      },);
      map.current!.addLayer(
        {
          'id': 'network',
          'source': 'network',
          'source-layer': 'network',
          'type': 'line',
          'layout': {
            'line-cap': 'round',
            'line-join': 'round',
          },
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
              'line-blur': 1,
              'line-width': 4,
        }    
      },
      labelLayerId
    );
      // //Add a layer for symbols along the line.
      // map.current!.addLayer({
      //   'id': 'line-symbols',
      //   'type': 'symbol',
      //   'source': 'network',
      //   'source-layer': 'network',
      //   'layout': {            
      //       //Reference the templated icon.        
      //       'icon-image': 'arrow',
      //       'symbol-placement': 'line-center',
      //       'icon-size': 0.03,
      //       'symbol-spacing': 100,
      //       'icon-rotate': 90
      //   },
      //   paint: {
      //       'icon-opacity': 0.8,
      //   }
      // });
      
      // map.current!.addSource('nodes', {
      //   type: "vector",
      //   url: 'pmtiles://https://d1txe6hhqa9d2l.cloudfront.net/jibe_nodes.pmtiles',
      //   attribution:
      //     '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      // },);

      // // Add a layer for pedestrian crossings.
      // map.current!.addLayer(
      //     {
      //         'id': 'pedestrian_crossing',
      //         'source': 'nodes',
      //         'source-layer': 'nodes',
      //         'type': 'circle',
      //         'filter': ['==', 'ped_cros', 'Car signal'],
      //         paint: {
      //             // 'circle-opacity': 0.8,
      //             'circle-radius': 4,
      //             'circle-color': '#2caa4a',
      //             'circle-stroke-width': 1,
      //             'circle-stroke-color': '#fff'
      //         }
      //         // 'layout': {
      //         //     'icon-image': 'pedestrian',
      //         //     'icon-size': 0.05,
      //         //     'icon-overlap': 'always'
      //         //     // 'symbol-z-order': 'auto',
      //         // },
      //     },
      //     labelLayerId
      // );
      // iterate over the layer list and add checkboxes
      // for (const layer in layer_list) {
      //   const input = document.createElement('input');
      //   input.type = 'checkbox';
      //   input.id = layer;
      //   input.checked = true;
      //   if (filterGroup) {
      //     filterGroup.appendChild(input);
      //   }
      //   const label = document.createElement('label');
      //   label.setAttribute('for', layer);
      //   label.textContent = layer_list[layer];
      //   if (filterGroup) {
      //     filterGroup.appendChild(label);
      //   }
        // When the checkbox changes, update the visibility of the layer.
        // input.addEventListener('change', (e) => {
        //   if (e.target) {
        //     map.current!.setLayoutProperty(
        //       layer,
        //       'visibility',
        //       e.target.checked ? 'visible' : 'none'
        //     );
        //   }
        // });
      // }

      //  map.addControl(new MapboxLegendControl({}, {reverseOrder: false}), 'bottom-left');
    // }
});

  }, [lng, lat, zoom]);
  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

export default Map;