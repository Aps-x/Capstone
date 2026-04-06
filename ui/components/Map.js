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
    static styles = new CSSStyleSheet();
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
            if (this.#mapSettings == null) {
                return;
            }

            this.#syncSpatialLayers();
        });
    }

    /**
     * Accepts the new MapSettings event payload and then rerenders the map.
     * @param {Event} event Map settings updated by ControlPanel.
     */
    #handleUpdatedMapSettings(event) {
        const updatedMapSettings = event.detail;

        if (!(updatedMapSettings instanceof MapSettings)) {
            return;
        }

        this.#mapSettings = updatedMapSettings;
        this.#syncSpatialLayers();
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
                    // Ensure we are only looking at Point geometries
                    if (!feature.geometry || feature.geometry.type !== 'Point') {
                        return false;
                    }

                    // Check standard top-level GeoJSON id
                    if (feature.id !== undefined && String(feature.id) === String(queryId)) {
                        return true;
                    }

                    // Check the first property in the properties object dynamically
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

    /**
     * Orchestrates the synchronization of spatial layers between IndexedDB and the web map.
     * @returns {Promise<void>}
     */
    async #syncSpatialLayers() {
        try {
            const spatialLayers = await DATABASE.getAll(OBJECT_STORES.SPATIAL_LAYERS);

            // Remove anything on the map that is no longer in the DB
            this.#cleanupOrphanedLayers(spatialLayers);

            // Handle empty state
            if (spatialLayers.length === 0) {
                console.warn(`No spatial layers found in the database. Map cleared.`);
                return;
            }

            // Add or update the valid layers
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
     * Determines if a layer should be rendered based on current MapSettings.
     * @param {string} geometryType The GeoJSON geometry type.
     * @returns {boolean}
     */
    #shouldRenderLayer(geometryType) {
        // If settings haven't loaded yet, default to rendering everything
        if (!this.#mapSettings) return true;

        if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            return this.#mapSettings.renderPoints;
        }

        if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            return this.#mapSettings.renderLines;
        }

        return true;
    }

    /**
     * Filters GeoJSON features based on power parameters and bus types defined in MapSettings.
     * @param {Object} geojsonData Original GeoJSON FeatureCollection
     * @returns {Object} Filtered GeoJSON FeatureCollection
     */
    #filterGeojsonFeatures(geojsonData) {
        // This is the ugliest code I have ever been responsible for. Please understand
        // that there is a tight deadline. Apologies for this abomination.
        if (!this.#mapSettings) return geojsonData;

        const {
            vMax, vMin, pMax, pMin, qMax, qMin,
            showGeneration, showTransmission, showDistribution
        } = this.#mapSettings;

        const filteredFeatures = geojsonData.features.filter(feature => {
            const props = feature.properties;
            if (!props) return true;

            // 1. Voltage Filter
            const v = props['V (kV)'] ?? props.voltage ?? props.v;
            if (v !== undefined && (Number(v) < vMin || Number(v) > vMax)) return false;

            // 2. Active Power Filter 
            const p = props['P (MW)'] ?? props.power ?? props.p;
            if (p !== undefined && (Number(p) < pMin || Number(p) > pMax)) return false;

            // 3. Reactive Power Filter
            const q = props['Q (MVar)'] ?? props.reactive_power ?? props.q;
            if (q !== undefined && (Number(q) < qMin || Number(q) > qMax)) return false;

            // 4. Bus Type Filter
            const typeStr = String(props['Type'] ?? props.type ?? '').toLowerCase();
            
            if (typeStr) {
                // Adjust these string matches if your dataset uses different terminology
                // for Transmission or Distribution
                const isGen = typeStr.includes('generation');
                const isTrans = typeStr.includes('transmission');
                const isDist = typeStr.includes('distribution') || typeStr.includes('load');

                if (isGen && !showGeneration) return false;
                if (isTrans && !showTransmission) return false;
                if (isDist && !showDistribution) return false;
            }

            return true;
        });

        return {
            ...geojsonData,
            features: filteredFeatures
        };
    }

    /**
     * Handles the logic for a single layer, deciding whether to update its data, build it from scratch, or skip it.
     * @param {string|number} layerKey The unique ID of the layer.
     * @param {Object} layerGeojson The GeoJSON data for the layer.
     */
    #renderOrUpdateSingleLayer(layerKey, layerGeojson) {
        const sourceId = `spatial-source-${layerKey}`;
        const layerId = `spatial-layer-${layerKey}`;

        if (!layerGeojson || !layerGeojson.features || layerGeojson.features.length === 0) {
            return;
        }

        const geometryType = layerGeojson.features[0]?.geometry?.type;

        if (!geometryType) {
            return;
        }

        // 1. Settings Check: Should this geometry type be rendered globally?
        if (!this.#shouldRenderLayer(geometryType)) {
            // Actively remove the layer and source if they were already rendered but toggled off
            if (this.#webmap.getLayer(layerId)) this.#webmap.removeLayer(layerId);
            if (this.#webmap.getSource(sourceId)) this.#webmap.removeSource(sourceId);
            return;
        }

        // 2. Filter down the features array via MapSettings
        const filteredGeojson = this.#filterGeojsonFeatures(layerGeojson);

        const existingSource = this.#webmap.getSource(sourceId);

        if (existingSource) {
            existingSource.setData(filteredGeojson);
            
            // Re-add the layer if it was removed by a previous settings change, but the source remained
            if (!this.#webmap.getLayer(layerId)) {
                // Pass the original layerGeojson to guarantee we can read the geometry type for configuration
                const layerConfig = this.#generateLayerConfig(layerId, sourceId, layerGeojson);
                if (layerConfig) {
                    this.#webmap.addLayer(layerConfig);
                    if (layerConfig.type === 'circle') this.#attachLayerEvents(layerId);
                }
            }
        } 
        else {
            this.#addNewLayerToMap(layerId, sourceId, filteredGeojson, layerGeojson);
        }
    }

    /**
     * Injects a brand new source and layer into the web map and attaches necessary events.
     * @param {string} layerId The constructed map layer ID.
     * @param {string} sourceId The constructed map source ID.
     * @param {Object} filteredGeojson The GeoJSON data (post-filters) to provide to the source.
     * @param {Object} originalGeojson The original GeoJSON used strictly to determine layer configuration properties.
     */
    #addNewLayerToMap(layerId, sourceId, filteredGeojson, originalGeojson) {
        this.#webmap.addSource(sourceId, {
            type: 'geojson',
            data: filteredGeojson
        });

        const layerConfig = this.#generateLayerConfig(layerId, sourceId, originalGeojson);

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
}

customElements.define('map-x', Map);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
Map.styles.replaceSync(/*css*/`
    .map {
        z-index: var(--z-base);
        grid-column: 1/-1;
        height: 100vh;
        width: 100vw;
    }
`);

if (!document.adoptedStyleSheets.includes(Map.styles)) {
    document.adoptedStyleSheets.push(Map.styles);
}