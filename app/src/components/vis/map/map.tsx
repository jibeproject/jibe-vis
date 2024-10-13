import { FC, useRef, useEffect, useState } from 'react';
import { FocusFeature} from '../../utilities';
import cities from '../stories/cities.json';
import stories from '../stories/stories.json';
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
import formatPopup from './popup_info';
import LegendInfo from './legend_info';
import { Steps, Hints } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useSearchParams } from 'react-router-dom';
import ScenarioSettings from './map_scenario_settings';
import { ShareURL } from '../../share';
import ReactDOM from 'react-dom';

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
  const [focusFeature, setFocusFeature] = useState(new FocusFeature({}));
  const [_clickedFeatureId, setClickedFeatureId] = useState<string | null>(null);
  const featureLoaded = useRef(false);
  
  const scenario_setting = new ScenarioSettings();
  scenario_setting.initialize(searchParams, stories, cities);

  const initial_query = Object.fromEntries(searchParams.entries());
  focusFeature.update(initial_query);

  const scenario = scenario_setting.get();
  // console.log(scenario);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lat] = useState<number>(Number(initial_query['lat'] || scenario['lat']));
  const [lng] = useState<number>(Number(initial_query['lng'] || scenario['lng']));
  const [zoom] = useState<number>(Number(initial_query['zoom'] || scenario['zoom']));
  const bounds = new maplibregl.LngLatBounds(scenario['bounds'] as unknown as LngLatLike); 
  let map_layers: string[] = [];
  
  const handleMapClick = (
    e: MapMouseEvent, features:maplibregl.MapGeoJSONFeature[]
  ) => {
    if (features[0] && 'id' in features[0]) {
      // Add parameters to the URL query string
      focusFeature.update({
        xy: e.lngLat.lng + ',' + e.lngLat.lat,
        source: String(features[0]['source']) ?? '',
        layer: String(features[0]['layer']['id']) ?? '',
        id: String(features[0]['id']) ?? ''
      });
    }
    // displayFeatureCheck(features[0], scenario_layer);
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
      pitch: scenario.layers[0].extrude===undefined ? 0: 60,
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
      // Add sources from scenario, if defined
      if (scenario.source) Object.entries(scenario.source).forEach(([key, value]) => {
        map.current!.addSource(key, value as maplibregl.SourceSpecification);
      });
      // Add layers, if defined
      if (scenario.layers) scenario.layers.forEach((value: maplibregl.LayerSpecification) => {
      map_layers.push(value.id);
      const scenario_layer = scenario.layers.find((x: { id: string; })=> x.id === value.id)
      map.current!.addLayer(style_layer(scenario_layer, value), labelLayerId);
      if (scenario_layer && 'popup' in scenario_layer) {
        const popup = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true
        });
        map.current!.on('click', scenario_layer.id, function(e) {
          if (scenario_layer.popup && e.features && e.features.length > 0) {
            formatPopup(e.features[0], e.lngLat, map, popup, scenario_layer.id, scenario_layer);
            displayFeatureCheck(e.features[0], scenario_layer);
              // console.log(e.features)
          }
        });
      }
      });
      // Add overlay filter group if defined
      const filterGroup = document.getElementById('filter-group')
      if (scenario.overlays && filterGroup) {
        scenario.overlays.forEach((overlays: any) => {
          console.log(overlays.source);
          if (overlays["source-layers"]) {
            Object.keys(overlays["source-layers"]).forEach((over_layer: any) => {
              const symbol = overlays["source-layers"][over_layer].icon;
              const layer_ID = `poi-${symbol}`;
              const name = overlays["source-layers"][over_layer].name;
              console.log(symbol, layer_ID);
              if (!map.current!.getLayer(over_layer)) {
                  map.current!.addLayer({
                      'id': layer_ID,
                      'type': 'symbol'  ,
                      'source': overlays.source,
                      'source-layer': over_layer,
                      'layout': {
                          'icon-image': `${symbol}_15`,
                          'icon-overlap': 'always'
                      },
                      'filter': ['==', 'name', symbol]
                  });

                  // Add checkbox and label elements for the layer.
                  const input = document.createElement('input');
                  input.type = 'checkbox';
                  input.id = layer_ID;
                  input.checked = true;
                  filterGroup.appendChild(input);

                  const label = document.createElement('label');
                  label.setAttribute('for', layer_ID);
                  label.textContent = name;
                  filterGroup.appendChild(label);

                  // When the checkbox changes, update the visibility of the layer.
                  input.addEventListener('change', (e) => {
                      map.current!.setLayoutProperty(
                        layer_ID,
                          'visibility',
                          (e.target as HTMLInputElement).checked ? 'visible' : 'none'
                      );
                  });
              }
          });
          }

          //   const symbol = value.icon;
          //   const layerID = `poi-${symbol}`;
          // map_layers.push(value.id);
          // map.current!.addLayer(style_layer(value, value), labelLayerId);
        });
      }
      document.getElementById('variable-select')?.addEventListener('change', function() {
        const selectedVariable = (this as HTMLSelectElement).value;
        updateMapLayer(selectedVariable, scenario, map, focusFeature);
      });
      
      document.getElementById('variable-filter')?.addEventListener('change', function() {
        const selectedVariable = (document.getElementById('variable-select') as HTMLSelectElement)?.value
        updateMapLayer(selectedVariable, scenario, map, focusFeature);
      });

      const legendRow = document.getElementById('legend-row');
      if (legendRow) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const className = (legendRow as HTMLSelectElement).className;
          const layer_IDs = scenario.layers.map((layer: maplibregl.LayerSpecification) => layer.id);
          if (className && className.startsWith('filtered')) {
            const filter_greq = Number(className.split('-')[2]);
            const filter_le = Number(className.split('-')[3]);
            layer_IDs.forEach((layer_ID: string) => {
              const layer_type = map.current!.getLayer(layer_ID)?.type;
              const color_style = layer_type === 'fill-extrusion'? 'fill-extrusion-color': 
                                  layer_type === 'fill' ? 'fill-color' : 'line-color';
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
            
            focusFeature.update({'filter': className.replace('filtered-', '')});
            
          } else if (className === 'unfiltered') {
            layer_IDs.forEach((layer_ID: string) => {
              map.current!.setFilter(layer_ID, null);
            });
            
            focusFeature.update({'filter':''});
            
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
      
        focusFeature.update({'source':'','layer':'','id':''});
      
      })


      function getFeatureFromURL() {
        const url_feature = Object.fromEntries(searchParams.entries());
        // console.log('get feature: ', url_feature)
        if (url_feature.v) {
          const variableSelect = document.getElementById('variable-select') as HTMLSelectElement;
          if (variableSelect && url_feature.v) {
            variableSelect.value = url_feature.v;
            variableSelect.dispatchEvent(new Event('change')); 
          }
        }
        if (url_feature.zoom) {
          const new_zoom = parseFloat(url_feature.zoom)
          map.current!.setZoom(new_zoom);
        }

        if (url_feature.source && url_feature.layer && url_feature.id && url_feature.xy) {
          const features = map.current!.queryRenderedFeatures(
          { layers: [url_feature.layer] }
          );
        const feature = features!.find((feat) => String(feat.id) === url_feature.id);
        // setClickedFeatureId(url_feature.id);
        if (feature) {
          const scenario_layer = scenario.layers.find((x: { id: string; })=> x.id === feature.layer.id)
          if ('popup' in scenario_layer) {
            const xy = url_feature.xy.split(',').map(Number) as [number, number];
            formatPopup(feature, xy, map, popup, url_feature.layer, scenario_layer);
          }
          map.current!.setFeatureState(
            { 
              source: scenario_layer['source'], 
              sourceLayer: scenario_layer['source-layer'], 
              id: feature.id 
            },
            { click: true }
          );
          displayFeatureCheck(feature, scenario_layer);
        }
        }
        if (url_feature.filter && !featureLoaded.current) {
          // console.log(url_feature.filter)
          const legendRow = document.getElementById('legend-row');
          if (legendRow) {
            // legendRow.className = 'filtered-' + url_feature.filtered;
            const filterCellIndex = url_feature.filter.split('-')[0];
            const legendCell = document.getElementById(`legend-cell-${filterCellIndex}`);
            if (legendCell) {
              legendCell.click();
            }
          }
        }
        // window.history.replaceState({}, document.title, window.location.pathname);
      };
      
      map.current!.on('sourcedata', (e) => {
      if (e.isSourceLoaded && !featureLoaded.current) {
        getFeatureFromURL()
        featureLoaded.current = true;
        }
      });
      });

    map.current!.on('zoomend', function() {
      const zoomLevel = Math.round(map.current!.getZoom() * 10) / 10;
      focusFeature.update({'zoom': zoomLevel.toString()});
      setFocusFeature(focusFeature);
    });
    map.current!.on('moveend', function() {
      const center = map.current!.getCenter();
      focusFeature.update({'lat': center.lat.toFixed(4),'lng': center.lng.toFixed(4)});
      setFocusFeature(focusFeature);
    });

    map.current!.on('click', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: map_layers });
      const feature = features[0];
      if (!feature) return;
      const featureId = feature.id as string;
      const scenario_layer = scenario.layers.find((x: { id: string; })=> x.id === feature.layer.id)
      setClickedFeatureId((prevClickedFeatureId) => {
        if (prevClickedFeatureId === featureId) {
          // If the feature is already clicked, reset its state
          map.current!.setFeatureState(
            { 
              source: scenario_layer['source'], 
              sourceLayer: scenario_layer['source-layer'], 
              id: featureId 
            },
            { click: false }
          );
          return null;
        } else {
          // If a different feature is clicked, update the state
          if (prevClickedFeatureId !== null) {
            // Reset the previously clicked feature state
            map.current!.setFeatureState(
              { 
                source: scenario_layer['source'], 
                sourceLayer: scenario_layer['source-layer'], 
                id: prevClickedFeatureId 
              },
              { click: false }
            );
          }
          map.current!.setFeatureState(
            { 
              source: scenario_layer['source'], 
              sourceLayer: scenario_layer['source-layer'], 
              id: featureId 
            },
            { click: true }
          );
          return featureId;
        }
      });
    // console.log(scenario_layer)
    // for (var i = 0; i < features.length; i++) {
    //   console.log(features[i])
    //   map.current!.setFeatureState({
        // source: scenario_layer['source'], 
        // sourceLayer: scenario_layer['source-layer'], 
    //     id: features[i].id}, {click: true});
    // }
    handleMapClick(e, features);
    });
  }, [featureLoaded, scenario, focusFeature]);

  // console.log([lng, lat, zoom, url_feature, featureLoaded])
  return (
    <div className="map-wrap">
      <ShareURL focusFeature={focusFeature} />
      <Steps
          enabled={true}
          steps={scenario.steps}
          initialStep={0}
          onExit={(stepIndex: number) => console.log('Intro step: ', stepIndex)}
        />
      <Hints enabled={true} hints={scenario.hints} />
      <Flex>
        <div ref={mapContainer} className="map" />
        <LegendInfo scenario={scenario}/>
        <nav id="filter-group" className="filter-group"></nav>
      </Flex>
    </div>
  );
}




function displayFeatureCheck(feature: maplibregl.MapGeoJSONFeature, scenario_layer: any) {
  const mapFeaturesContainer = document.getElementById('map-features');
  if (mapFeaturesContainer && feature && feature.layer) {
    // initialise displayProperties as a JSON object
    let displayProps: { [key: string]: any; } = {};
    // console.log(feature)
    Object.keys(scenario_layer.dictionary).forEach(key => {
      scenario_layer.dictionary[key] !== scenario_layer.dictionary[scenario_layer.index.variable] ? ( 
      displayProps[scenario_layer.dictionary[key]] = feature['properties'][key as keyof typeof feature['properties']]):null;
    });
    const featureID = feature.properties[scenario_layer.index.variable].toString()
    if (mapFeaturesContainer) {
      ReactDOM.render(
          <BasicTable featureID={featureID} indicator_values={displayProps} scenario_layer={scenario_layer} />,
          mapFeaturesContainer
      );
    }
  }
}

const updateMapLayer = (
  selectedVariable: string,
  scenario: any,
  map: React.MutableRefObject<maplibregl.Map | null>,
  focusFeature: any
) => {
  if (scenario.layers[scenario.legend_layer].dictionary[selectedVariable]) {
      const fillColor = map.current!.getPaintProperty(
          scenario.layers[scenario.legend_layer].id,
          scenario.layers[scenario.legend_layer].extrude ? 'fill-extrusion-color' : 'fill-color'
      );
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
          map.current!.setPaintProperty(
              scenario.layers[scenario.legend_layer].id,
              scenario.layers[scenario.legend_layer].extrude ? 'fill-extrusion-color' : 'fill-color',
              updatedFillColor
          );
      }
      const legendRow = document.getElementById('legend-row');
      if (legendRow) {
          const className = (legendRow as HTMLSelectElement).className;
          const layer_IDs = scenario.layers.map((layer: maplibregl.LayerSpecification) => layer.id);
          if (className && className.startsWith('filtered')) {
              const filter_greq = Number(className.split('-')[2]);
              const filter_le = Number(className.split('-')[3]);
              layer_IDs.forEach((layer_ID: string) => {
                  const color_style = map.current!.getLayer(layer_ID)?.type === 'fill' ? 'fill-color' : 'line-color';
                  const style = map.current!.getPaintProperty(layer_ID, color_style);
                  if (style && Array.isArray(style)) {
                      const variableIndex = style.flat(Infinity).findIndex((element: any) => element === 'get');
                      const variable = variableIndex !== -1 ? style.flat(Infinity)[variableIndex + 1] : null;
                      if (variable) {
                          map.current!.setFilter(
                              layer_ID,
                              ['all', ['>=', ['get', variable], filter_greq], ['<', ['get', variable], filter_le]]
                          );
                      }
                  }
              });
          }
      }
  }

  focusFeature.update({ 'v': String(selectedVariable) ?? '' });
};

export default Map;

