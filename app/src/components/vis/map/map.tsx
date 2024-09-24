import { FC, useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { updateSearchParams } from '../../utilities';
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
import { BasicTable } from '../indicator_summary';
import { style_layer } from './map_style';
import cities from '../stories/cities.json';
import stories from '../stories/stories.json';
import formatPopup from '../stories/lts'
import LegendInfo from './legend_info'
import { Button } from '@mui/material';
import { Steps, Hints } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useSearchParams } from 'react-router-dom';

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

const Map: FC<MapProps> = (): JSX.Element => {
  const [searchParams, _] = useSearchParams();
  
  const fallbackCity = 'Melbourne'
  const pathway = searchParams.get('pathway')
  const story = stories.find((story) => story.page === pathway);
  let city: string;
  let scenario_settings: { [key: string]: any } = {};
  if (story && story.params && story.params) {
    scenario_settings = story.params;
    city = searchParams.get('city') || scenario_settings['city'] || fallbackCity;
  }
  else {
    scenario_settings = {};
    city = searchParams.get('city') || fallbackCity;
  };
  const fallbackParams: { [key: string]: any } = cities[city as keyof typeof cities] || cities[fallbackCity];

  if (!scenario_settings.steps) {
    scenario_settings.steps = [];
  }
  if (!scenario_settings.hints) {
    scenario_settings.hints = [];
  }
  if (!scenario_settings.layers) {
    scenario_settings.layers = [];  
  }
  if (!scenario_settings.legend_layer) {
    scenario_settings.legend_layer = 0;  
  }
  if (!scenario_settings.dictionary) {
    if (scenario_settings.layers.length > 0) {
      scenario_settings.dictionary = scenario_settings.layers[scenario_settings.legend_layer].dictionary;
    } else {
      scenario_settings.dictionary = {};
    }
  }
  if (!scenario_settings.focus && scenario_settings.layers[scenario_settings.legend_layer].focus) {
    scenario_settings.focus = scenario_settings.layers[scenario_settings.legend_layer].focus;
  } else {
    scenario_settings.focus = {};
  }
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
  let url_feature = {
    source: searchParams.get('source'),
    layer: searchParams.get('layer'),
    id: searchParams.get('id'),
    xy: searchParams.get('xy')?.split(',').map(parseFloat) as [number, number],
    v: searchParams.get('v'),
    filtered: searchParams.get('filter'),
  }
  const [featureLoaded, setFeatureLoaded] = useState<boolean>(false);
  // Melbourne bbox
  const bounds = new maplibregl.LngLatBounds(params['bounds'] as unknown as LngLatLike); 
  let map_layers: string[] = [];
  
  const handleMapClick = (e: MapMouseEvent, features:maplibregl.MapGeoJSONFeature[], scenario_settings: { [key: string]: any }) => {
    if (features[0] && 'id' in features[0]) {
      // Add parameters to the URL query string
      updateSearchParams({
        xy: e.lngLat.lng + ',' + e.lngLat.lat,
        source: String(features[0]['source']) ?? '',
        layer: String(features[0]['layer']['id']) ?? '',
        id: String(features[0]['id']) ?? ''
      });
    }
    displayFeatureCheck(features[0], scenario_settings);
  };

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
              '<a href="https://protomaps.com" target="_blank">Protomaps</a> © <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>',
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
      const scenario_layer = scenario_settings.layers.find((x: { id: string; })=> x.id === value.id)
      map.current!.addLayer(style_layer(scenario_layer, value), labelLayerId);
      if (scenario_layer && 'popup' in scenario_layer) {
        const popup = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true
        });
        map.current!.on('click', scenario_layer.id, function(e) {
          if (scenario_layer.popup && e.features && e.features.length > 0) {
        formatPopup(e.features[0], e.lngLat, map, popup, scenario_layer.id);
        // console.log(e.features)
          }
        });
      }
      });
    
    document.getElementById('variable-select')?.addEventListener('change', function() {
    const selectedVariable = (this as HTMLSelectElement).value;
    if (scenario_settings.layers[scenario_settings.legend_layer].dictionary[selectedVariable]) {
      const fillColor = map.current!.getPaintProperty(scenario_settings.layers[scenario_settings.legend_layer].id, 'fill-color');  
      if (fillColor) { 
        const updateFillColor = (color: any): any => {
        if (Array.isArray(color)) {
          return color.map((element) => {
          if (Array.isArray(element) && element[0] === 'get') {
          return ['get', selectedVariable];
          }
          return updateFillColor(element);
          });
        }
        return color;
        };

        const updatedFillColor = updateFillColor(fillColor);
        map.current!.setPaintProperty(scenario_settings.layers[scenario_settings.legend_layer].id, 'fill-color', updatedFillColor);
      }
    }
    
    updateSearchParams({'v': String(selectedVariable) ?? ''});
    
    });
    
    const legendRow = document.getElementById('legend-row');
    if (legendRow) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const className = (legendRow as HTMLSelectElement).className;
        const layer_IDs = scenario_settings.layers.map((layer: maplibregl.LayerSpecification) => layer.id);
        if (className && className.startsWith('filtered')) {
          const filter_greq = Number(className.split('-')[2]);
          const filter_le = Number(className.split('-')[3]);
          layer_IDs.forEach((layer_ID: string) => {
            const color_style = map.current!.getLayer(layer_ID)?.type === 'fill' ? 'fill-color' : 'line-color';
            const style = map.current!.getPaintProperty(layer_ID, color_style)
            if (style && Array.isArray(style) ) {
            const variableIndex = style.flat(Infinity).findIndex((element: any) => element === 'get');
            const variable = variableIndex !== -1 ? style.flat(Infinity)[variableIndex + 1] : null;
            if (variable) {
            map.current!.setFilter(
            layer_ID, 
            ['all', ['>=', ['get', variable], filter_greq], 
            ['<', ['get', variable], filter_le]]
            );
            }
            }
          }); 
          
          updateSearchParams({'filter': className.replace('filtered-', '')});
          
        } else if (className === 'unfiltered') {
          layer_IDs.forEach((layer_ID: string) => {
            map.current!.setFilter(layer_ID, null);
          });
          
          updateSearchParams({'filter':''});
          
        }
      }
      });
    });

    observer.observe(legendRow, {
      attributes: true,
      attributeFilter: ['class'],
    });
    }

    // Create a popup, but don't add it to the map yet.
    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true
    });
    popup.on('close', () => {
    
      updateSearchParams({'source':'','layer':'','id':''});
    
    })


    function getFeatureFromURL() {
    if (url_feature.v) {
      const variableSelect = document.getElementById('variable-select') as HTMLSelectElement;
      if (variableSelect && url_feature.v) {
      variableSelect.value = url_feature.v;
      variableSelect.dispatchEvent(new Event('change')); 
    }
    }

    if (url_feature.source && url_feature.layer && url_feature.id && url_feature.xy) {
      const features = map.current!.queryRenderedFeatures(
      { layers: [url_feature.layer] }
      );
    const feature = features!.find((feat) => String(feat.id) === url_feature.id);
    if (feature) {
      const scenario_layer = scenario_settings.layers.find((x: { id: string; })=> x.id === feature.layer.id)
      if ('popup' in scenario_layer) {
      formatPopup(feature, url_feature.xy, map, popup, url_feature.layer);
      setFeatureLoaded(true);
      }
      displayFeatureCheck(feature, scenario_settings)
    }
    }
    if (url_feature.filtered) {
      const legendRow = document.getElementById('legend-row');
      if (legendRow) {
        // legendRow.className = 'filtered-' + url_feature.filtered;
        const filterCellIndex = url_feature.filtered.split('-')[0];
        const legendCell = document.getElementById(`legend-cell-${filterCellIndex}`);
        if (legendCell) {
          legendCell.click();
        }
      }
    }
    };
    
    map.current!.on('sourcedata', (e) => {
    if (e.isSourceLoaded && !featureLoaded) {
      getFeatureFromURL()
      setFeatureLoaded(true);
      }
    });
    });

  map.current!.on('zoomend', function() {
    const zoomLevel = Math.round(map.current!.getZoom() * 10) / 10;
    
    updateSearchParams({'zoom': zoomLevel.toString()});
    
  });
  map.current!.on('moveend', function() {
    const center = map.current!.getCenter();
    
    updateSearchParams({'lat': center.lat.toFixed(4),'lng': center.lng.toFixed(4)});
    
  });


  map.current.on('click', (e) => {
  const features = map.current!.queryRenderedFeatures(e.point, { layers: map_layers });
  handleMapClick(e, features, scenario_settings);
  });
  
  // map.current.on('unmount', () => {
  //     // Clear search parameters when the component unmounts
  //     navigate(window.location.pathname, { replace: true });
  //   });

}, [lng, lat, zoom, url_feature, featureLoaded]);

  // console.log([lng, lat, zoom, url_feature, featureLoaded])
  return (
    <div className="map-wrap">
      <Steps
          enabled={true}
          steps={scenario_settings.steps}
          initialStep={0}
          onExit={(stepIndex: number) => console.log('Intro step: ', stepIndex)}
        />
      <Hints enabled={true} hints={scenario_settings.hints} />
      <Flex>
        <div ref={mapContainer} className="map" />
        <LegendInfo scenario_settings={scenario_settings} story={story} />
      </Flex>
    </div>
  );
}




function displayFeatureCheck(feature: maplibregl.MapGeoJSONFeature, scenario_settings: any) {
  const featureCheck = document.getElementById('map-features');
  if (featureCheck && feature && feature.layer) {
    // get the relevant layer from scenario_settings
    const scenario_layer = scenario_settings.layers.find((x: { id: string; })=> x.id === feature.layer.id)
    // initialise displayProperties as a JSON object
    let displayProps: { [key: string]: any; } = {};
    // console.log(feature)
    Object.keys(scenario_layer.dictionary).forEach(key => {
      scenario_layer.dictionary[key] !== scenario_layer.dictionary[scenario_layer.index.variable] ? ( 
      displayProps[scenario_layer.dictionary[key]] = feature['properties'][key as keyof typeof feature['properties']]):null;
    });
    const featureID = feature.properties[scenario_layer.index.variable].toString()
    featureCheck.innerHTML = BasicTable(featureID, displayProps, scenario_layer);
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