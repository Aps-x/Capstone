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
    /** @type {maplibregl.Marker} */ #activeMarker;

    constructor() {
        super();

        EVENT_BUS.on(EVENTS.COLOR_SCHEME_UPDATED, () => this.#handleUpdatedColorScheme());
        EVENT_BUS.on(EVENTS.MAP_SETTINGS_UPDATED, (event) => this.#handleUpdatedMapSettings(event));
        EVENT_BUS.on(EVENTS.MAP_SEARCH_INITIATED, (event) => this.#handleSearchQuery(event));
        EVENT_BUS.on(EVENTS.MARKER_PANEL_CLOSED, () => this.#handleMarkerPanelClosed());
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

        // User color scheme preference = auto, browser chooses the theme.
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
            this.#syncSpatialLayers();
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
        this.#syncSpatialLayers();
    }

    /**
 * Orchestrates the synchronization of spatial layers between IndexedDB and the web map.
 * @returns {Promise<void>}
 */
    async #syncSpatialLayers() {
        try {
            const spatialLayers = await DATABASE.getAll(OBJECT_STORES.SPATIAL_LAYERS);

            // 1. Remove anything on the map that is no longer in the DB
            this.#cleanupOrphanedLayers(spatialLayers);

            // 2. Handle empty state
            if (spatialLayers.length === 0) {
                console.warn(`No spatial layers found in the database. Map cleared.`);
                return;
            }

            // 3. Add or update the valid layers
            this.#upsertSpatialLayers(spatialLayers);

        } 
        catch (error) {
            console.error('Encountered an error when syncing spatial layers:', error);
        }
    }

    /**
     * Removes map layers and sources that do not exist in the provided database data.
     * @param {Array} databaseLayers The current layers fetched from IndexedDB.
     */
    #cleanupOrphanedLayers(databaseLayers) {
        const validLayerKeys = new Set(databaseLayers.map(layer => layer.id));
        const currentStyle = this.#webmap.getStyle();

        if (!currentStyle || !currentStyle.layers) {
            return;
        }

        for (const mapLayer of currentStyle.layers) {
            if (mapLayer.id.startsWith('spatial-layer-')) {
                const layerKey = mapLayer.id.replace('spatial-layer-', '');

                if (!validLayerKeys.has(layerKey)) {
                    this.#webmap.removeLayer(mapLayer.id);

                    const sourceId = `spatial-source-${layerKey}`;
                    if (this.#webmap.getSource(sourceId)) {
                        this.#webmap.removeSource(sourceId);
                    }
                }
            }
        }
    }

    /**
     * Iterates through database layers to either update existing map sources or create new ones.
     * @param {Array} databaseLayers The current layers fetched from IndexedDB.
     */
    #upsertSpatialLayers(databaseLayers) {
        for (const layer of databaseLayers) {
            if (layer.data == null) {
                console.warn(`Skipping layer ${layer.id}: No geojson found in database object`);
                continue;
            }

            this.#renderOrUpdateSingleLayer(layer.id, layer.data);
        }
    }

    /**
     * Handles the logic for a single layer, deciding whether to update its data or build it from scratch.
     * @param {string|number} layerKey The unique ID of the layer.
     * @param {Object} layerGeojson The GeoJSON data for the layer.
     */
    #renderOrUpdateSingleLayer(layerKey, layerGeojson) {
        const sourceId = `spatial-source-${layerKey}`;
        const layerId = `spatial-layer-${layerKey}`;

        const existingSource = this.#webmap.getSource(sourceId);

        if (existingSource) {
            existingSource.setData(layerGeojson);
        } 
        else {
            this.#addNewLayerToMap(layerId, sourceId, layerGeojson);
        }
    }

    /**
     * Injects a brand new source and layer into the web map and attaches necessary events.
     * @param {string} layerId The constructed map layer ID.
     * @param {string} sourceId The constructed map source ID.
     * @param {Object} layerGeojson The GeoJSON data.
     */
    #addNewLayerToMap(layerId, sourceId, layerGeojson) {
        this.#webmap.addSource(sourceId, {
            type: 'geojson',
            data: layerGeojson
        });

        const layerConfig = this.#generateLayerConfig(layerId, sourceId, layerGeojson);

        if (layerConfig) {
            this.#webmap.addLayer(layerConfig);

            // Attach interaction events ONLY to point layers
            if (layerConfig.type === 'circle') {
                this.#attachLayerEvents(layerId);
            }
        }
    }

    /**
     * Generates a layer configuration object based on the GeoJSON geometry type.
     * @param {string} layerId The unique identifier to assign to the new layer.
     * @param {string} sourceId The identifier of the data source this layer will use.
     * @param {Object} geojsonData The GeoJSON FeatureCollection.
     * @returns {Object|null} The configuration object for `addLayer`, or `null` if the geometry type is unsupported.
     */
    #generateLayerConfig(layerId, sourceId, geojsonData) {
        // Inspect the first feature to determine the geometry type
        const geometryType = geojsonData.features[0].geometry.type;

        if (!geometryType) {
            console.warn(`Skipping layer config for ${layerId}: First feature is missing a valid geometry type.`);
            return null;
        }

        const baseConfig = {
            id: layerId,
            source: sourceId,
        };

        // Render nodes/points (e.g., buses, substations)
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
                    'line-width': 2
                }
            };
        }

        console.warn(`Unsupported geometry type: ${geometryType} for layer ${layerId}`);
        return null;
    }

    /**
     * Attaches mouse interaction events to a specific map layer.
     * @private
     * @param {string} layerId The unique identifier of the map layer to attach events to.
     * @returns {void}
     */
    #attachLayerEvents(layerId) {
        this.#webmap.on('mouseenter', layerId, () => {
            this.#webmap.getCanvas().style.cursor = 'pointer';
        });

        this.#webmap.on('mouseleave', layerId, () => {
            this.#webmap.getCanvas().style.cursor = '';
        });

        this.#webmap.on('click', layerId, (event) => {
            const feature = event.features[0];

            this.#selectPoint(feature, false);
        });
    }

    /**
     * Selects a point feature, draws a marker, and optionally flies to it.
     * @param {Object} feature The GeoJSON feature to select
     * @param {boolean} shouldFlyTo Whether the map should pan/zoom to the point
     */
    #selectPoint(feature, shouldFlyTo = true) {
        const coordinates = feature.geometry.coordinates;

        if (this.#activeMarker) {
            this.#activeMarker.remove();
        }

        this.#activeMarker = new maplibregl.Marker({
            color: '#009abd'
        })
        .setLngLat(coordinates)
        .addTo(this.#webmap);

        if (shouldFlyTo) {
            this.#webmap.flyTo({
                center: coordinates,
                zoom: 8, 
                essential: false, 
                speed: 1.2
            });
        }

        EVENT_BUS.emit(EVENTS.MAP_MARKER_CLICKED, feature.properties);
    }

    /**
     * Handles a search query by searching the raw GeoJSON data in the database.
     * This ensures we can find and fly to features even if they are currently off-screen.
     * @param {Event} event The event containing the search query.
     */
    async #handleSearchQuery(event) {
        const queryId = event.detail;

        if (!queryId) {
            console.warn('Search failed: invalid search query.');
            return;
        }

        try {
            const spatialLayers = await DATABASE.getAll(OBJECT_STORES.SPATIAL_LAYERS);

            for (const layer of spatialLayers) {
                const layerGeojson = layer.data;

                if (!layerGeojson || !layerGeojson.features) {
                    continue;
                }

                const targetFeature = layerGeojson.features.find(feature => {
                    // 1. Check standard top-level GeoJSON id
                    if (feature.id !== undefined && String(feature.id) === String(queryId)) {
                        return true;
                    }

                    // 2. Check the first property in the properties object dynamically
                    if (feature.properties) {
                        const propertyKeys = Object.keys(feature.properties);
                        if (propertyKeys.length > 0) {
                            const firstKey = propertyKeys[0];
                            return String(feature.properties[firstKey]) === String(queryId);
                        }
                    }
                    
                    return false;
                });

                if (targetFeature) {
                    this.#selectPoint(targetFeature, true);
                    return;
                }
            }
            EVENT_BUS.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, `Search failed. Node with key: "${queryId}" not found.`);
            console.warn(`Search failed. Node with key: ${queryId} not found.`);
        } 
        catch (error) {
            console.error('Encountered an error while searching the database:', error);
        }
    }

    /**
     * Removes the active marker when the marker panel is closed
     * @returns {void}
     */
    #handleMarkerPanelClosed() {
        if (this.#activeMarker) {
            this.#activeMarker.remove();
        }
    }
}

customElements.define('map-x', Map);