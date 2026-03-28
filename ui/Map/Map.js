import { DATABASE } from "../../core/Database.js";
import { OBJECT_STORES } from "../../core/DatabaseConfig.js";
import { EVENT_BUS } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
import MapSettings from "../../core/MapSettings.js";
//------------------------------------------------------------------------------------
/**
 * Facade for the mapping library. Provides an API for web map CRUD operations.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
export default class Map extends HTMLElement {
    /** @type {maplibregl.Map} */ #webmap;
    /** @type {MapSettings} */ #mapSettings;

    constructor() {
        super();
        
        EVENT_BUS.on(EVENTS.MAP_SETTINGS_UPDATED, (event) => this.#handleUpdatedMapSettings(event));
        EVENT_BUS.on(EVENTS.COLOR_SCHEME_UPDATED, () => this.#handleUpdatedColorScheme());
    }

    connectedCallback() {
        this.classList.add('map');
        this.#createMap();
        this.classList.remove('maplibregl-map');
    }

    /**
     * Instantiates the web map. 
     * @returns {void}
     */
    #createMap() {
        const mapCenter = [134, -28];
        const zoomLevel = 4;

        this.#webmap = new maplibregl.Map({
            style: this.#determineMapStyle(),
            center: mapCenter,
            zoom: zoomLevel,
            container: this,
            attributionControl: false,
        });
    }

    /**
     * Determines the appropriate map style JSON path based on the user's color scheme preference
     * or the browser's default theme.
     * @returns {string} The URL/path to the map style JSON file.
     */
    #determineMapStyle() {
        const darkStyle = "./themes/dark.json";
        const lightStyle = "./themes/bright.json";

        const userColorSchemePreference = document.querySelector('meta[name="color-scheme"]')?.getAttribute('content');
        
        if (userColorSchemePreference === "dark") {
            return darkStyle;
        }
        else if (userColorSchemePreference === "light") {
            return lightStyle;
        }

        const browserPrefersDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (browserPrefersDarkTheme) {
            return darkStyle;
        }
        else {
            return lightStyle;
        }
    }

    /**
     * Reacts to the updated color scheme by setting a new map style. Then rerenders the map.
     * @returns {void}
     */
    #handleUpdatedColorScheme() {
        const mapStyle = this.#determineMapStyle();

        this.#webmap.setStyle(mapStyle);

        // Setting the map style refreshes the map, removing any rendered map data.
        // Listen for the map to finish and then rerender.
        this.#webmap.once('idle', () => {
            this.#renderMapData();
        });
    }

    /**
     * Accepts the new MapSettings event payload and then rerenders the map.
     * @param {Event} event Map settings updated by ControlPanel.
     */
    #handleUpdatedMapSettings(event) {
        const updatedMapSettings = event.detail;

        if (!updatedMapSettings instanceof MapSettings) {
            return;
        }

        this.#mapSettings = updatedMapSettings;
        this.#renderMapData();
    }


    async #renderMapData() {
        try {
            // Retrieve all spatial layers from IndexedDB
            const spatialLayers = await DATABASE.getAll(OBJECT_STORES.SPATIAL_LAYERS);

            for (const layer of spatialLayers) {
                const layerKey = layer.id; 
                const file = layer.file;

                if (!file) {
                    console.warn(`Skipping layer ${layerKey}: No file found in DB object.`);
                    continue;
                }

                // 2. Read the File object and parse it into GeoJSON
                let geojsonData;
                try {
                    // Extract the raw text from the file
                    const fileText = await file.text(); 
                    // Convert the text into a JavaScript Object
                    geojsonData = JSON.parse(fileText); 
                } 
                catch (parseError) {
                    console.error(`Failed to parse GeoJSON for layer ${layerKey} (${file.name}):`, parseError);
                    continue; // Skip to the next layer if this file is corrupted or not JSON
                }

                const sourceId = `spatial-source-${layerKey}`;
                const layerId = `spatial-layer-${layerKey}`;

                // 3. Validate GeoJSON before proceeding
                if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
                    console.warn(`Skipping layer ${layerKey} (${file.name}): No valid features found.`);
                    continue;
                }

                const existingSource = this.#webmap.getSource(sourceId);

                // 4. Update existing source or create a new one
                if (existingSource) {
                    existingSource.setData(geojsonData);
                } 
                else {
                    this.#webmap.addSource(sourceId, {
                        type: 'geojson',
                        data: geojsonData 
                    });

                    // Generate layer config based on geometry (Point vs. Line)
                    const layerConfig = this.#generateLayerConfig(layerId, sourceId, geojsonData);
                    
                    if (layerConfig) {
                        this.#webmap.addLayer(layerConfig);
                        
                        // Attach interaction events ONLY to point layers
                        if (layerConfig.type === 'circle') {
                            this.#attachLayerEvents(layerId); 
                        }
                    }
                }
            }
        } 
        catch (error) {
            console.error('Failed to render spatial layers from DB:', error);
        }
    }

    #generateLayerConfig(layerId, sourceId, geojsonData) {
        // Inspect the first feature to determine the geometry type
        const geometryType = geojsonData.features[0].geometry.type;

        const baseConfig = {
            id: layerId,
            source: sourceId,
        };

        // Render nodes/points (e.g., buses, stations)
        if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            return {
                ...baseConfig,
                type: 'circle',
                paint: {
                    'circle-radius': 5,
                    'circle-color': '#FFC107',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#000000'
                }
            };
        } 
        
        // Render grid lines/edges (e.g., power lines, routes)
        if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            return {
                ...baseConfig,
                type: 'line',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#2196F3',
                    'line-width': 3
                }
            };
        }

        console.warn(`Unsupported geometry type: ${geometryType} for layer ${layerId}`);
        return null; 
    }

    #attachLayerEvents(layerId) {
        // Change cursor to pointer when hovering over a point
        this.#webmap.on('mouseenter', layerId, () => {
            this.#webmap.getCanvas().style.cursor = 'pointer';
        });

        // Revert cursor when leaving the point
        this.#webmap.on('mouseleave', layerId, () => {
            this.#webmap.getCanvas().style.cursor = '';
        });

        // Handle clicks on the point
        this.#webmap.on('click', layerId, (e) => {
            const featureProperties = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();
            
            console.log(`Point clicked on ${layerId}:`, featureProperties);

            // Ensure the popup appears over the correct copy of the feature if the map is zoomed out
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Ready for MapLibre Popup integration here
        });
    }

}

customElements.define('map-x', Map);