import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as pmtiles from "pmtiles";
import layers from "protomaps-themes-base";
import { getUrl } from 'aws-amplify/storage';
import './map.css';

const basemap = await getUrl({
  path: "jibe_study_region.pmtiles",
  options: {
    validateObjectExistence: false,  // defaults to false
    expiresIn: 900, // validity of the URL, in seconds. defaults to 900 (15 minutes) and maxes at 3600 (1 hour)
    useAccelerateEndpoint: true // Whether to use accelerate endpoint.
  },
});

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

interface MapProps {}

const Map: React.FC<MapProps> = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng] = useState<number>(145.1072);
  const [lat] = useState<number>(-37.8189);
  const [zoom] = useState<number>(9);
   
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
            url: `pmtiles://${basemap}`,
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
          },
        },
        layers: layers("protomaps", "light"),
      },
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, [lng, lat, zoom]);
  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

export default Map;