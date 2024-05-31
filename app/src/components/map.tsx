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

const Map: FC<MapProps> = () => {
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
  map.current.on('load', () => {
  // Insert buildings layer beneath any symbol layer.
  if (map.current) {
    const layers = map.current.getStyle().layers;

    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && (layers[i].layout as any)['text-field']) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    map.current.addLayer(
        {
            'id': '3d-buildings',
            'source': 'protomaps',
            'source-layer': 'buildings',
            'type': 'fill',
            'layout': {},
            'paint': {
                'fill-color': '#f08',
                'fill-opacity': 0.4
            },
            // 'type': 'fill-extrusion',
            'minzoom': 15,
            // 'paint': {
            //     'fill-extrusion-color': [
            //         'interpolate',
            //         ['linear'],
            //         ['get', 'height'], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
            //     ],
            //     'fill-extrusion-height': [
            //         'interpolate',
            //         ['linear'],
            //         ['zoom'],
            //         15,
            //         0,
            //         16,
            //         ['get', 'height']
            //     ],
            //     'fill-extrusion-base': ['case',
            //         ['>=', ['get', 'zoom'], 16],
            //         ['get', 'min_height'], 0
            //     ]
            // }
        },
        labelLayerId
    );
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