import Bus from "../../core/Bus.js";
import { EVENT_BUS } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
//------------------------------------------------------------------------------------
/**
 * Facade for the mapping library. Provides an API for web map CRUD operations.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
export default class Map extends HTMLElement {
    #MAP_CENTER = [134, -28];
    #ZOOM_LEVEL = 4;
    /** @type {maplibregl.Map} */ #webmap;
    /** @type {Bus[]} */ #busManifest = [];

    constructor() {
        super();
        
        EVENT_BUS.on(EVENTS.MAP_SETTINGS_UPDATED, (event) => this.#handleUpdatedMapSettings(event));
        EVENT_BUS.on(EVENTS.COLOR_SCHEME_UPDATED, () => this.#handleUpdatedColorScheme());
    }

    connectedCallback() {
        this.classList.add('map');
        this.#createMap();
        this.classList.remove('maplibregl-map');
        this.#initialize();
    }

    async #initialize() {
        // TODO: The Map should not be collecting data, this will eventually be removed.
        this.#busManifest = await this.#fetchBusData('./data/XY Position.csv');
    }

    /**
     * Reacts to updated color scheme by setting a new map style.
     * 
     * @returns {void}
     */
    #handleUpdatedColorScheme() {
        const mapStyle = this.#determineMapStyle();

        this.#webmap.setStyle(mapStyle);

        // Setting the map style refreshes the map, removing any markers.
        // Listen for the map to finish and then rerender.
        this.#webmap.once('idle', () => {
            // TODO: Render bus markers will eventually be refactored.
            this.renderPoints(0.002, 145, -30);
        });
    }

    #handleUpdatedMapSettings(event) {
        // TODO: This will eventually receive a MapConfig object instead.
        const formData = event.detail;

        const scale = Number(formData.get('scale'));
        const offsetX = Number(formData.get('offsetX'));
        const offsetY = Number(formData.get('offsetY'));
        
        this.renderPoints(scale, offsetX, offsetY);
    }

    /**
     * Instantiates the web map. 
     * 
     * @returns {void}
     */
    #createMap() {
        this.#webmap = new maplibregl.Map({
            style: this.#determineMapStyle(),
            center: this.#MAP_CENTER,
            zoom: this.#ZOOM_LEVEL,
            container: this,
            attributionControl: false,
        });
    }

    /**
     * Determines the appropriate map style JSON path based on the user's color scheme preference
     * or the browser's default theme.
     * 
     * @returns {string} The URL/path to the map style JSON file.
     */
    #determineMapStyle() {
        const darkStyle = "./themes/dark.json";
        const lightStyle = "./themes/bright.json";

        const userColorSchemePreference = document.querySelector('meta[name="color-scheme"]')?.getAttribute('content');
        
        if (userColorSchemePreference === "dark") {
            return darkStyle;
        }
        if (userColorSchemePreference === "light") {
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
     * Fetches bus data from a CSV file and parses it into an array of Bus instances.
     * 
     * @param {string} csvUrl The URL path to the CSV file.
     * @returns {Promise<Bus[]>} A promise that resolves to an array of Bus objects.
     */
    async #fetchBusData(csvUrl) {
        // TODO: This should be removed from this class.
        try {
            const response = await fetch(csvUrl);
            const csvData = await response.text();
            return this.#parseBusData(csvData);
        }
        catch (error) {
            console.error("Failed to load or process bus data:", error);
            return [];
        }
    }
    
    /**
     * Parses raw CSV text into structured Bus objects.
     * 
     * @param {string} csv Raw CSV string containing bus data.
     * @returns {Bus[]} An array of instantiated Bus objects.
     */
    #parseBusData(csv) {
        // TODO: This should be removed from this class.
        // Gets lines from csv, splits lines into header and data
        const lines = csv.trim().split(/\r?\n/);
        const headerLine = lines[0];
        const dataLines = lines.slice(1);

        // Individual headers
        const headers = headerLine.split(',');

        const busIndex = headers.indexOf('BUS#');
        const xIndex = headers.indexOf('x');
        const yIndex = headers.indexOf('y');

        return dataLines
            .filter(Boolean)
            .map(line => {
                const row = line.split(',');
                return new Bus(
                    row[busIndex],           
                    parseFloat(row[xIndex]), 
                    parseFloat(row[yIndex]) 
                );
            });
    }

    /**
     * Renders points to the web map based on the current `#busManifest` array.
     * 
     * @param {Number} scale Multiplier for each bus x and y value
     * @param {Number} offsetX Additional x offset
     * @param {Number} offsetY Additional y offset
     * @returns {void}
     */
    renderPoints(scale, offsetX, offsetY) {
        const sourceId = 'bus-markers-source';
        const layerId = 'bus-markers-layer';
        
        const geojsonData = this.#generateBusGeoJson(scale, offsetX, offsetY);

        const existingSource = this.#webmap.getSource(sourceId);

        if (existingSource) {
            existingSource.setData(geojsonData);
            return;
        }

        this.#webmap.addSource(sourceId, {
            type: 'geojson',
            data: geojsonData
        });

        this.#webmap.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
                'circle-radius': 5,
                'circle-color': '#FFC107',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#000000'
            }
        });

        this.#attachBusMarkerEvents(layerId);
    }

    /**
     * Attaches click and hover events to the bus marker layer.
     * 
     * @param {String} layerId The ID of the layer to attach events to
     */
    #attachBusMarkerEvents(layerId) {
        this.#webmap.on('click', layerId, (event) => {
            const clickedFeature = event.features[0];
            EVENT_BUS.emit(EVENTS.MAP_MARKER_CLICKED, clickedFeature.properties);
        });

        this.#webmap.on('mouseenter', layerId, () => {
            this.#webmap.getCanvas().style.cursor = 'pointer';
        });

        this.#webmap.on('mouseleave', layerId, () => {
            this.#webmap.getCanvas().style.cursor = '';
        });
    }

    /**
     * Transforms the current bus manifest into a GeoJSON FeatureCollection.
     * 
     * @returns {JSON}
     */
    #generateBusGeoJson(scale, offsetX, offsetY) {
        // TODO: This might belong in another class.
        return {
            type: 'FeatureCollection',
            features: this.#busManifest.map(bus => {
                const transformedLongitude = (bus.longitude * scale) + offsetX;
                const transformedLatitude = (bus.latitude * scale) + offsetY;

                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [transformedLongitude, transformedLatitude]
                    },
                    properties: {
                        id: bus.id,
                        originalX: bus.longitude,
                        originalY: bus.latitude,
                        transLong: transformedLongitude,
                        transLat: transformedLatitude
                    }
                };
            })
        };
    }
}

customElements.define('map-x', Map);