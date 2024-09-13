import { FC, useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSearchParams } from 'react-router-dom';
import maplibregl, { LngLatLike, MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// import * as pmtiles from "pmtiles";
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
import { BasicTable } from './indicator_summary';
 
import cities from './stories/cities.json';
import stories from './stories/stories.json';
import formatPopup from './stories/lts'
import LegendInfo from './map/legend_info'
import { Button } from '@mui/material';

// const protocol = new pmtiles.Protocol();

// maplibregl.addProtocol("pmtiles", protocol.tile);
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


// function getFormatPopup(path:string) {
//     return import(path)
// };

// const filterGroup = document.getElementById('filter-group');
const Map: FC<MapProps> = (): JSX.Element => {
  const [searchParams, _] = useSearchParams();  
  
  const fallbackCity = 'Melbourne'
  const pathway = searchParams.get('pathway')
  const story = stories.find((story) => story.page === pathway);
  let city: string;
  let scenario_settings: any;
  if (story && story.params && story.params) {
    scenario_settings = story.params;
    city = searchParams.get('city') || scenario_settings['city'] || fallbackCity;
  }
  else {
    scenario_settings = {};
    city = searchParams.get('city') || fallbackCity;
  };
  const fallbackParams: { [key: string]: any } = cities[city as keyof typeof cities] || cities[fallbackCity];
  
  function getSetting(setting:string){
    return searchParams.get(setting) || scenario_settings[setting] || fallbackParams[setting]
  }
  
  // const formatPopup = getFormatPopup(scenario_settings.poup)

  const params = {
    'lat': getSetting('lat'),
    'lng': getSetting('lng'),
    'zoom': getSetting('zoom'),
    'bounds': getSetting('bounds'),
  }
  // console.log(params);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lat] = useState<number>(Number(params['lat']));
  const [lng] = useState<number>(Number(params['lng']));
  const [zoom] = useState<number>(Number(params['zoom']));
  const url_feature = {
    source: searchParams.get('source'),
    layer: searchParams.get('layer'),
    id: searchParams.get('id'),
    xy: searchParams.get('xy')?.split(',').map(parseFloat) as [number, number],
  }
  const [featureLoaded, setFeatureLoaded] = useState<boolean>(false);
  // Melbourne bbox
  const bounds = new maplibregl.LngLatBounds(params['bounds'] as unknown as LngLatLike); 
  let map_layers: string[] = [];

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
            url: 'pmtiles://https://d1txe6hhqa9d2l.cloudfront.net/jibe_basemap.pmtiles',
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
          },
        },
        layers: layers("protomaps", "grayscale"),
      },
      center: [lng, lat],
      zoom: zoom,
      maxBounds: bounds,
      attributionControl: false,
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(exportControl, 'top-right');
    map.current.addControl(new maplibregl.AttributionControl(),'bottom-left')
    map.current.on('load', async () => {
      // toggleSidebar('left');
      const layers = map.current!.getStyle().layers;
      // create image icons
      let labelLayerId:string;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && (layers[i].layout as any)['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }
      // Add sources from scenario_settings, if defined
      if (scenario_settings.source) Object.entries(scenario_settings.source).forEach(([key, value]) => {
          map.current!.addSource(key, value as maplibregl.SourceSpecification);
      });
      // Add layers, if defined
      if (scenario_settings.layers) scenario_settings.layers.forEach((value: maplibregl.LayerSpecification) => {
        map_layers.push(value.id);
        map.current!.addLayer(value, labelLayerId);
        if (scenario_settings && 'popup' in scenario_settings) {
          scenario_settings.layers.forEach((layer: maplibregl.LayerSpecification) => {
            const layerId = layer.id;
            const popup = new maplibregl.Popup({
              closeButton: true,
              closeOnClick: true
            });
            map.current!.on('click', layerId, function(e) {
              if (scenario_settings.popup && e.features && e.features.length > 0) {
          formatPopup(e.features[0], e.lngLat, map, popup, layerId);
          // console.log(e.features)
              }
            });
          });
        }
      // Check if the select element exists and has a value
      const variableSelect = document.getElementById('variable-select') as HTMLSelectElement;
      if (variableSelect && variableSelect.value) {
        variableSelect.addEventListener('change', () => {
          const selectedVariable = variableSelect.value;
          if (scenario_settings.dictionary[selectedVariable]) {
        const fillColor = map.current!.getPaintProperty(scenario_settings.focus.select_layer, 'fill-color');
        // console.log(fillColor);
        if (fillColor) { 
            const updatedFillColor = Array.isArray(fillColor) ? fillColor.map((element: any) => {
            if (Array.isArray(element) && element[0] === 'get') {
              return ['get', selectedVariable];
            }
            return element;
            }): fillColor;
            map.current!.setPaintProperty(scenario_settings.focus.select_layer, 'fill-color', updatedFillColor);
        }
          }
        });
      }
  // Create a popup, but don't add it to the map yet.
  const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true
  });
  popup.on('close', () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('source');
    url.searchParams.delete('layer');
    url.searchParams.delete('id');
    window.history.pushState(null, '', url.toString());
  })


  function getFeatureFromURL() {
    // if (url_feature.xy) {
      // const xy = url_feature.xy.split(',');
      // const features = map.current!.queryRenderedFeatures(
      //   [Number(xy[0]), Number(xy[1])],
      //   { layers: map_layers }
      // );
    if (url_feature.source && url_feature.layer && url_feature.id && url_feature.xy) {
      const features = map.current!.queryRenderedFeatures(
        { layers: [url_feature.layer],
          // filter: ['==', 'id', url_feature.id]
         }
      );
    const feature = features!.find((feat) => String(feat.id) === url_feature.id);
    if (feature) {
      // const e = {
      //   lngLat: {
      //     lngLat: {
      //       lng: url_feature.xy[0],
      //       lat: url_feature.xy[1]
      //     }
      //   },
      //   point: url_feature.xy
      // } as unknown as MapMouseEvent;
      if (scenario_settings && 'popup' in scenario_settings) {
        formatPopup(feature, url_feature.xy, map, popup, url_feature.layer);
        setFeatureLoaded(true);
        }
      displayFeatureCheck(feature, scenario_settings)
    }
    }
    };
  
  map.current!.on('sourcedata', (e) => {
    if (e.isSourceLoaded && !featureLoaded) {
      getFeatureFromURL()
      // console.log(e.sourceId)
    }
  });
  });

  map.current!.on('zoomend', function() {
    const zoomLevel = Math.round(map.current!.getZoom() * 10) / 10;
    const url = new URL(window.location.href);
    url.searchParams.set('zoom', zoomLevel.toString());
    window.history.pushState(null, '', url.toString());
  });
  map.current!.on('moveend', function() {
    const center = map.current!.getCenter();
    const url = new URL(window.location.href);
    url.searchParams.set('lat', center.lat.toFixed(4));
    url.searchParams.set('lng', center.lng.toFixed(4));
    window.history.pushState(null, '', url.toString());
  });
});


map.current.on('click', (e) => {
  const features = map.current!.queryRenderedFeatures(e.point, { layers: map_layers });
  handleMapClick(e, features, scenario_settings);
});
  }, [lng, lat, zoom, url_feature]);
  return (
    <div className="map-wrap">
      <Flex>
      <div ref={mapContainer} className="map" />
        {LegendInfo({scenario_settings, story})}
      </Flex>
    </div>
  );
}


const handleMapClick = (e: MapMouseEvent, features:maplibregl.MapGeoJSONFeature[], scenario_settings: any) => {

  if (features[0] && 'id' in features[0]) {
    // Add the id to the URL query string
    const url = new URL(window.location.href);
    url.searchParams.set('xy', e.lngLat.lng + ',' + e.lngLat.lat);
    url.searchParams.set('source', String(features[0]['source']) ?? '');
    url.searchParams.set('layer', String(features[0]['layer']['id']) ?? '');
    url.searchParams.set('id', String(features[0]['id']) ?? '');
    window.history.pushState(null, '', url.toString());
  }
  
  displayFeatureCheck(features[0], scenario_settings);
};


function displayFeatureCheck(feature: maplibregl.MapGeoJSONFeature, scenario_settings: any) {
  const featureCheck = document.getElementById('map-features');
  if (featureCheck && 'layer' in feature) {
    // initialise displayProperties as a JSON object
    let displayProps: { [key: string]: any; } = {};
    console.log(feature)
    Object.keys(scenario_settings.dictionary).forEach(element => {
      displayProps[scenario_settings.dictionary[element]] = feature['properties'][0][element as keyof typeof feature['properties']];
    });
    const layer_id = feature.layer.id;
    const return_variables = [
      "RTN_cycleTime",
      "RTN_walkTime",
      "RTN_bikeStressDiscrete",
      "RTN_bikeStress",
      "RTN_walkStress",
      "RTN_LTS"
    ];

    if (layer_id === 'network_rtn') {
      return_variables.forEach((variable) => {
        const replacement: string = variable.replace('RTN_', '');
        displayProps[scenario_settings.dictionary[replacement]] = feature['properties'][0][variable as keyof typeof feature['properties']];
      });
    }

    featureCheck.innerHTML = BasicTable(displayProps, scenario_settings);
    const clearButton = document.createElement('div');
    const root = createRoot(clearButton);
    root.render(
      <Button
        id="clear-indicators-button"
        onClick={() => {
          const mapFeaturesElement = document.getElementById('map-features');
          if (mapFeaturesElement) {
            mapFeaturesElement.textContent = '';
          }
        } }
      >
        Close
      </Button>
    );
    featureCheck.appendChild(clearButton);
  }
}


export default Map;