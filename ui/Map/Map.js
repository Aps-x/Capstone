import Bus from "../../core/Bus.js";
//------------------------------------------------------------------------------------
/**
 * Facade for the mapping library. Provides an API for web map CRUD operations.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
export default class Map extends HTMLElement {
    /** @type {maplibregl.Map} */
    #map;

    /** @type {Bus[]} */
    #busManifest = [];

    #mapCenter = [134, -28];

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('map');
        this.#initialize();
    }

    async #initialize() {
        this.#createMap();
        this.classList.remove('maplibregl-map');

        this.#observeColorThemeChanges();
        
        this.#busManifest = await this.#fetchBusData('./data/XY Position.csv');
    }

    /**
     * Instantiates the web map. 
     * 
     * @returns {void}
     */
    #createMap() {
        this.#map = new maplibregl.Map({
            style: this.#determineMapStyle(),
            center: this.#mapCenter,
            zoom: 4,
            container: this,
            attributionControl: false,
        });
    }

    /**
     * Commences observing the color-theme meta tag for changes to the color-theme.
     * 
     * @returns {void}
     */
    #observeColorThemeChanges() {
        const colorSchemeMetaTag = document.querySelector('meta[name="color-scheme"]');
        
        if (colorSchemeMetaTag == null) {
            return;
        }

        // Start observing the meta tag for attribute changes
        const themeObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'content') {
                    this.#updateMapStyle();
                }
            }
        });

        themeObserver.observe(colorSchemeMetaTag, { attributes: true });
    }

    /**
     * Updates the web map style based on current theme preferences.
     * 
     * @returns {void}
     */
    #updateMapStyle() {
        const mapStyle = this.#determineMapStyle();

        this.#map.setStyle(mapStyle);

        // Setting the map style acts as a refresh, so markers need to be re-rendered.
        this.#map.once('idle', () => { 
            this.renderBusMarkers(0.002, 145, -30);
        });
    }

    /**
     * Determines the appropriate map style JSON path based on the user's color scheme preference
     * or the browser's default theme.
     * 
     * @returns {string} The URL/path to the map style JSON file.
     */
    #determineMapStyle() {
        const DARK_STYLE = "./themes/dark.json";
        const LIGHT_STYLE = "./themes/bright.json";

        const userColorSchemePreference = document.querySelector('meta[name="color-scheme"]')?.getAttribute('content');
        
        if (userColorSchemePreference === "dark") {
            return DARK_STYLE;
        }
        if (userColorSchemePreference === "light") {
            return LIGHT_STYLE;
        }

        const browserPrefersDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (browserPrefersDarkTheme) {
            return DARK_STYLE;
        }
        else {
            return LIGHT_STYLE;
        }
    }

    /**
     * Fetches bus data from a CSV file and parses it into an array of Bus instances.
     * 
     * @param {string} csvUrl The URL path to the CSV file.
     * @returns {Promise<Bus[]>} A promise that resolves to an array of Bus objects.
     */
    async #fetchBusData(csvUrl) {
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
     * Renders markers to the web map based on the current `#busManifest` array,
     * clearing any existing markers first.
     * 
     * @param {Number} scale Multiplier for each bus x and y value
     * @param {Number} offsetX Additional x offset
     * @param {Number} offsetY Additional y offset
     * @returns {void}
     */
    renderBusMarkers(scale, offsetX, offsetY) {
        //
        //TODO: This needs to be refactored. Function should take the GEOJson and map settings
        //      objects as parameters.
        //

        const SOURCE_ID = 'bus-markers-source';
        const LAYER_ID = 'bus-markers-layer';
        
        const geojsonData = {
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

        const existingSource = this.#map.getSource(SOURCE_ID);

        if (existingSource) {
            existingSource.setData(geojsonData);
        } 
        else {
            this.#map.addSource(SOURCE_ID, {
                type: 'geojson',
                data: geojsonData
            });

            this.#map.addLayer({
                id: LAYER_ID,
                type: 'circle',
                source: SOURCE_ID,
                paint: {
                    'circle-radius': 5,
                    'circle-color': '#FFC107',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#000000'
                }
            });
        }
    }
}

customElements.define('map-x', Map);