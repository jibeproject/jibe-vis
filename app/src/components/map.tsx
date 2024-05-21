import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as pmtiles from "pmtiles";
import layers from "protomaps-themes-base";
import './map.css';

// const basemap = await getUrl({
//   path: "tiles/jibe_study_region.pmtiles",
//   options: {
//     validateObjectExistence: false,  // defaults to false
//     expiresIn: 900, // validity of the URL, in seconds. defaults to 900 (15 minutes) and maxes at 3600 (1 hour)
//     useAccelerateEndpoint: true // Whether to use accelerate endpoint.
//   },
// });

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

interface MapProps {}

const Map: React.FC<MapProps> = () => {
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
            tiles: [`https://doqejluq03387.cloudfront.net/jibe_study_region/{z}/{x}/{y}.mvt`],
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
          },
        },
        layers: layers("protomaps", "light"),
      },
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    // The 'building' layer in the streets vector source contains building-height
  // data from OpenStreetMap.
  map.current.on('load', () => {
    // Insert the layer beneath any symbol layer.
    if (map.current) {
      const layers = map.current.getStyle().layers;

      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && (layers[i].layout as any)['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.current.addSource('Melbourne', {
        url: `https://doqejluq03387.cloudfront.net/jibe_study_region.json`,
        type: 'vector',
      });

      map.current.addLayer(
          {
              'id': '3d-buildings',
              'source': 'Melbourne',
              'source-layer': 'buildings',
              'type': 'fill-extrusion',
              'minzoom': 15,
              'paint': {
                  'fill-extrusion-color': [
                      'interpolate',
                      ['linear'],
                      ['get', 'render_height'], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
                  ],
                  'fill-extrusion-height': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      15,
                      0,
                      16,
                      ['get', 'render_height']
                  ],
                  'fill-extrusion-base': ['case',
                      ['>=', ['get', 'zoom'], 16],
                      ['get', 'render_min_height'], 0
                  ]
              }
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