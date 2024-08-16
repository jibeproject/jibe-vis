import { FC, useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import maplibregl, { LngLatLike } from 'maplibre-gl';
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
import { indicators, BasicTable } from './indicator_summary';
import { MdInfo, MdQuestionMark} from 'react-icons/md';
import parse from 'html-react-parser';
 
import cities from './stories/cities.json';
import stories from './stories/stories.json';
import formatPopup from './stories/lts'


// const protocol = new pmtiles.Protocol();

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
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(exportControl, 'top-right');

    map.current.on('load', async () => {
      toggleSidebar('left');
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
        scenario_settings.layers.forEach((layer: maplibregl.LayerSpecification) => {
          const layerId = layer.id;
          map.current!.on('click', layerId, function(e) {
            if (e.features && e.features.length > 0) {
              formatPopup(e, map, popup, layerId);
            }
          });
      });

  // Create a popup, but don't add it to the map yet.
  const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true
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
  const features = map.current!.queryRenderedFeatures(e.point,{layers: map_layers}
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

  const featureCheck = document.getElementById('map-features');
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
    featureCheck.innerHTML = BasicTable(displayProperties);
};
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
                    <h2 id="indicator-heading">{story?.title||''}
                      <MdQuestionMark className="question" title="Find out more"/>
                    {/* <div className="details-modal-overlay"></div> */}
                    </h2>
                  </summary>
                  <div className="details-modal">
                    <div className="details-modal-content">
                      {parse(scenario_settings.help||'<p>Information has not yet been added for this scenario.</p>')}
                    </div>
                  </div>
                </details>
                <div id="indicator-content">
                  <div id="directions" title="How to use this map"> {scenario_settings.directions || 'This scenario has not yet been defined.'}</div>
                  {parse(scenario_settings.legend||"<div id='lts-legend'/>")}
                  <pre id="map-features">    
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
