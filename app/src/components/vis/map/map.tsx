import { FC, useRef, useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { FocusFeature} from '../../utilities';
import cities from '../stories/cities.json';
import stories from '../stories/stories.json';
import maplibregl, { LngLatLike, MapMouseEvent } from 'maplibre-gl';
// import { Point } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
// import protomapsV4 from './protomaps-v4.json';
import layers from "protomaps-themes-base";
// import { LayerSpecification } from 'maplibre-gl';
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
import { GraphPopupWrapper } from '../graphs.tsx';
import LegendInfo from './legend_info';
import { useIntroJs } from "../../hooks/useIntroJs";
import 'intro.js/introjs.css';
import { useSearchParams } from 'react-router-dom';
import ScenarioSettings from './map_scenario_settings';
import { ShareURL } from '../../share';

let root: Root | null = null;

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
  const [openPopup, setOpenPopup] = useState(false);
  const featureLoaded = useRef(false);
  const [selectedFeatureSet, setSelectedFeatureSet] = useState<{ feature: maplibregl.MapGeoJSONFeature; scenarioLayer: any; scenario: any } | null>(null);
  
  const scenario_setting = new ScenarioSettings();
  scenario_setting.initialize(searchParams, stories, cities);

  const initial_query = Object.fromEntries(searchParams.entries());
  focusFeature.update(initial_query);

  const scenario = scenario_setting.get();

  const { start, exit } = useIntroJs({
    steps: scenario.steps,
    hints: scenario.hints,
    // ...other options if needed
  });
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

  const tooltip = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    className: 'hover-tooltip'
  });

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
          }
        },
        // layers: protomapsV4['layers'] as LayerSpecification[]
        layers: layers("protomaps", "grayscale"),
      },
      center: [lng, lat],
      zoom: zoom,
      pitch: !scenario.layers[0]? 0 : scenario.layers[0].extrude===undefined ? 0: 60,
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
      if (scenario.sources) Object.entries(scenario.sources).forEach(([key, value]) => {
        map.current!.addSource(key, value as maplibregl.SourceSpecification) 
      });
      // Add layers, if defined
      if (scenario.layers) scenario.layers.forEach((value: maplibregl.LayerSpecification) => {
      map_layers.push(value.id);
        const scenario_layer = scenario.layers.find((x: { id: string; })=> x.id === value.id)
        map.current!.addLayer(style_layer(scenario_layer, value), labelLayerId);
        const selectLayers = scenario.layers.filter((layer: any) => layer['layer-select'] === true);
        if (scenario_layer.style === 'linkage-area') {
          map.current!.addLayer({
            'id': scenario_layer.id + '-outline',
            'source': scenario_layer.source,
            'source-layer': scenario_layer['source-layer'],
            'paint': {
                "line-color": "#000",
                "line-width": 2,
                "line-opacity": 0.5
            },
            'type': 'line'
          }, labelLayerId);
          if (selectLayers && scenario_layer.visible===false) {
            // set linkage-layer visibility to none
            map.current!.setLayoutProperty(scenario_layer.id, 'visibility', 'none');
            map.current!.setLayoutProperty(scenario_layer.id+'-outline', 'visibility', 'none');
          } else {
            updateMapLayerVisibility(selectLayers[0].id, scenario, map.current!, focusFeature);
          }
        };
        if (scenario_layer && 'popup' in scenario_layer) {
          const popup_click = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true
          });

          map.current!.on('click', scenario_layer.id, function(e) {
            if (scenario_layer.popup && e.features && e.features.length > 0) {
              displayFeatureCheck(e.features[0], scenario_layer);
              if (['graph', 'linkage'].includes(scenario_layer.popup)) {
                setSelectedFeatureSet({ feature: e.features[0], scenarioLayer: scenario_layer, scenario });
                setOpenPopup(true);
              } else {
                formatPopup(e.features[0], e.lngLat, map, popup_click, scenario_layer.id, scenario_layer);
              }
          }
        });
        }
      });
      // Add overlay filter group if defined
      const filterGroup = document.getElementById('filter-group')
      if (scenario.overlays && filterGroup) {
        const heading = document.createElement('h3');
        heading.textContent = scenario.overlays['id'];
        filterGroup.appendChild(heading);
        // console.log(scenario.overlays);
       if (scenario.overlays["source-layers"]) {
            Object.keys(scenario.overlays["source-layers"]).forEach((over_layer: any) => {
              const name = scenario.overlays["source-layers"][over_layer].name;
              if (!map.current!.getLayer(over_layer)) {
                  const overlay_style = {
                    'id': over_layer,
                    'type': 'circle',
                    'source': scenario.overlays.source,
                    'source-layer': over_layer,
                    'layout': {
                      'visibility': 'none' 
                    },
                    'paint': {
                      'circle-radius': 10,
                      'circle-color': '#2caa4a',
                    }
                  };
                  map.current!.addLayer(overlay_style as maplibregl.LayerSpecification);
                  // Add checkbox and label elements for the layer.
                  const input = document.createElement('input');
                  input.type = 'radio';
                  input.id = over_layer;
                  input.name = 'overlay-group'; 
                  input.checked = false;

                  const label = document.createElement('label');
                  label.setAttribute('for', over_layer);
                  label.textContent = name;

                  // Create a div to enclose the input and label
                  const div = document.createElement('div');
                  div.appendChild(input);
                  div.appendChild(label);
                  
                  // Append the div to the filterGroup
                  filterGroup.appendChild(div);
                  

                  // When the checkbox changes, update the visibility of the layer.
                  input.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.checked) {
                        // Uncheck all other checkboxes
                        const checkboxes = filterGroup.querySelectorAll('input[type="checkbox"]');
                        checkboxes.forEach((checkbox) => {
                            if (checkbox !== target) {
                                (checkbox as HTMLInputElement).checked = false;
                            }
                        });
                        // Hide all layers first
                        Object.keys(scenario.overlays["source-layers"]).forEach((layer: any) => {
                                map.current!.setLayoutProperty(layer, 'visibility', 'none');
                            });
                        // Show the selected layer
                        map.current!.setLayoutProperty(
                            over_layer,
                            'visibility',
                            'visible'
                        );
                    } else {
                        map.current!.setLayoutProperty(
                            over_layer,
                            'visibility',
                            'none'
                        );
                    }
                  });
              }
          });
          }
      }

      document.getElementById('variable-select')?.addEventListener('change', function() {
        const selectedVariable = (this as HTMLSelectElement).value;
        updateMapLayer(selectedVariable, scenario, map, focusFeature);
      });

      document.getElementById('layer-select')?.addEventListener('change', function() {
        const selectedLayer = (this as HTMLSelectElement).value;
        updateMapLayerVisibility(selectedLayer, scenario, map.current!, focusFeature);
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
          const layer_IDs = scenario.layers
            .filter((layer: any) => layer.focus !== undefined)
            .map((layer: maplibregl.LayerSpecification) => layer.id);
          if (className && className.startsWith('filtered')) {
            const filter_elements = className.split('-');
              layer_IDs.forEach((layer_ID: string) => {
                const layer_type = map.current!.getLayer(layer_ID)?.type;
                const color_style = layer_type === 'fill-extrusion'? 'fill-extrusion-color': 
                                    layer_type === 'fill' ? 'fill-color' : 'line-color';
                const style = map.current!.getPaintProperty(layer_ID, color_style)
                if (style && Array.isArray(style) ) {
                const variableIndex = style.flat(Infinity).findIndex((element: any) => element === 'get');
                const variable = variableIndex !== -1 ? style.flat(Infinity)[variableIndex + 1] : null;
                if (variable && !isNaN(Number(filter_elements[3]))) {
                  const filter_greq = Number(filter_elements[2]);
                  const filter_le = Number(filter_elements[3]);
                  // console.log(filter_greq, filter_le)
                map.current!.setFilter(
                layer_ID, 
                ['all', ['>=', ['get', variable], filter_greq], 
                ['<', ['get', variable], filter_le]]
                );
              } else {
                const filter_category= filter_elements[2];
                map.current!.setFilter(
                layer_ID, 
                ['==', ['get', variable], filter_category]
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
        const layer_select = document.getElementById('layer-select') as HTMLSelectElement;
        if (url_feature.layer && layer_select) {
          layer_select.value = url_feature.layer;
          layer_select.dispatchEvent(new Event('change'));
        }
        if (url_feature.v) {
          const variableSelect = document.getElementById('variable-select') as HTMLSelectElement;
          if (variableSelect && url_feature.v) {
            variableSelect.value = url_feature.v;
            variableSelect.dispatchEvent(new Event('change')); 
          }
        }
        if (url_feature.zoom) {
          const new_zoom = parseFloat(url_feature.zoom);
          if (!isNaN(new_zoom)) {
            map.current!.setZoom(new_zoom);
          }
        }

        if (url_feature.source && url_feature.layer && url_feature.id && url_feature.xy) {
          const features = map.current!.queryRenderedFeatures(
          { layers: [url_feature.layer] }
          );
          const checkAllTilesLoaded = () => {
          const source = map.current!.getSource(url_feature.source) as maplibregl.VectorTileSource;
          if (source && source.tiles) {
            const tiles = source.tiles.map(() => {
            const sourceCache = (map.current!.style.sourceCaches as any)[url_feature.source];
            const tiles = sourceCache ? sourceCache._tiles : {};
            return Object.values(tiles).every((tile: any) => tile.state === 'loaded');
            });
            return tiles.every((tileLoaded) => tileLoaded);
          }
          return false;
          };

          const interval = setInterval(() => {
          if (checkAllTilesLoaded()) {
            clearInterval(interval);
            const features = map.current!.queryRenderedFeatures(
            { layers: [url_feature.layer] }
            );
            const feature = features!.find((feat) => String(feat.id) === url_feature.id);
            // console.log(features);
            if (feature) {
            const scenario_layer = scenario.layers.find((x: { id: string; }) => x.id === feature.layer.id);
            if ('popup' in scenario_layer) {
              const xy = url_feature.xy.split(',').map(Number) as [number, number];
              displayFeatureCheck(feature, scenario_layer);
              if (['graph', 'linkage'].includes(scenario_layer.popup)) {
              setSelectedFeatureSet({ feature: feature, scenarioLayer: scenario_layer, scenario });
              setOpenPopup(true);
              } else {
              formatPopup(feature, xy, map, popup, url_feature.layer, scenario_layer);
              }
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
          }, 100);
        const feature = features!.find((feat) => String(feat.id) === url_feature.id);
        // console.log(features);
        // setClickedFeatureId(url_feature.id);
        if (feature) {
          const scenario_layer = scenario.layers.find((x: { id: string; })=> x.id === feature.layer.id)
          if ('popup' in scenario_layer) {
            const xy = url_feature.xy.split(',').map(Number) as [number, number];
            displayFeatureCheck(feature, scenario_layer);
            if (['graph', 'linkage'].includes(scenario_layer.popup)) {
              setSelectedFeatureSet({ feature: feature, scenarioLayer: scenario_layer, scenario });
              setOpenPopup(true);
            } else {
              formatPopup(feature, xy, map, popup, url_feature.layer, scenario_layer);
            }
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

    map.current!.on('mousemove', function(e) {
      // get the feature of layer linkage-area and
      // display scenario_layer.index.variable value in tooltip
      const features = map.current!.queryRenderedFeatures(e.point, { layers: map_layers });
      const feature = features[0];
      if (feature) {
        const scenario_layer = scenario.layers.find((x: { id: string; })=> x.id === feature.layer.id)
        const featureValue = feature.properties[scenario_layer.index.variable];
        const featureValueStr = featureValue ? featureValue.toString() : '';
        map.current!.getCanvas().style.cursor = 'pointer';
        if (featureValueStr!=='') {
          tooltip.setLngLat(e.lngLat).setHTML(
            `<p>${featureValueStr}<p>`
          ).addTo(map.current!);
      };
      } else {
        map.current!.getCanvas().style.cursor = '';
        tooltip.remove();
      }
    });

    map.current!.on('click', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: map_layers });
      const feature = features[0];
      // console.log(feature);
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
    
    start();
    return () => exit();
  }, [featureLoaded, scenario, focusFeature]);

  const handlePopupClose = () => {
    setOpenPopup(false);
  };
  // console.log([lng, lat, zoom, url_feature, featureLoaded])
  return (
    <div className="map-wrap">
      <ShareURL focusFeature={focusFeature} />
      <Flex>
        <div ref={mapContainer} className="map" />
        <LegendInfo scenario={scenario}/>
        {selectedFeatureSet && (
        <GraphPopupWrapper
          feature={selectedFeatureSet.feature}
          scenario_layer={selectedFeatureSet.scenarioLayer}
          scenario={selectedFeatureSet.scenario}
          open={openPopup}
          onClose={handlePopupClose}
          mapQuery={focusFeature.getAll()}
        />
      )}
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
    // console.log(feature.properties);
    const featureID = feature.properties[scenario_layer.index.variable]?.toString()
    if (!root) {
      root = createRoot(mapFeaturesContainer); // Create a root if it doesn't exist
    }
    root.render(
      <BasicTable featureID={featureID} indicator_values={displayProps} scenario_layer={scenario_layer} />
    );
  }
}

function updateMapLayerVisibility(selectedLayer: string, scenario: any, map: maplibregl.Map, focusFeature: any) {
  const layers = scenario.layers.filter((layer: any) => layer['layer-select'] === true);
  focusFeature.update({ 'layer': String(selectedLayer) ?? '' });
  // console.log(selectedLayer);
  const currentLayerIDs = map.getStyle().layers.map((layer: any) => layer.id);
  layers.forEach((layer: any) => {
      // console.log(layer.id, layer.id === selectedLayer);
      if (layer.id === selectedLayer) {
          map.setLayoutProperty(layer.id, 'visibility', 'visible');
          if (layer.style === 'linkage-area' && currentLayerIDs.includes(layer.id+'-outline')) {
            map.setLayoutProperty(layer.id+'-outline', 'visibility', 'visible');
          }
      } else {
          if ( layer.style === 'linkage-area' && currentLayerIDs.includes(layer.id)) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
          if (layer.style === 'linkage-area' && currentLayerIDs.includes(layer.id+'-outline')) {
            map.setLayoutProperty(layer.id+'-outline', 'visibility', 'none');
          }
      }
  });
}

const updateMapLayer = (
  selectedVariable: string,
  scenario: any,
  map: React.MutableRefObject<maplibregl.Map | null>,
  focusFeature: any
) => {
  if (scenario.layers[scenario.legend_layer].dictionary[selectedVariable]) {
      const layer = map.current!.getLayer(scenario.layers[scenario.legend_layer].id);
      if (layer?.type == 'fill') {
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
      } else if (layer?.type == 'line') {
        const lineColor = map.current!.getPaintProperty(
            scenario.layers[scenario.legend_layer].id,
            'line-color'
        );
        if (lineColor) {
            const updateLineColor = (color: any): any => {
                if (Array.isArray(color)) {
                    return color.map((element) => {
                        if (Array.isArray(element) && element[0] === 'get') {
                            return ['get', selectedVariable];
                        }
                        return updateLineColor(element);
                    });
                }
                return color;
            };

            const updatedLineColor = updateLineColor(lineColor);
            map.current!.setPaintProperty(
                scenario.layers[scenario.legend_layer].id,
                'line-color',
                updatedLineColor
            );
        }
      };
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

