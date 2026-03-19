import Bus from "/core/Bus.js";
//------------------------------------------------------------------------------------
/**
 * Facade for the mapping library. Provides an API for web map CRUD operations.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
export default class Map extends HTMLElement {
    #map = null;
    #mapCenter = [134, -28];
    #busData = [];
    #activeMarkers = [];

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('map');
        this.#initialize();
    }

    async #initialize() {
        this.#createMap();
        this.#observeColorThemeChanges();
        this.classList.remove('maplibregl-map');
        this.#busData = await this.#fetchBusData('/data/XY Position.csv');
    }

    /**
     * Creates the web map. 
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
     * Updates the web map style. 
     * 
     * @returns {void}
     */
    #updateMapStyle() {
        const mapStyle = this.#determineMapStyle();
        this.#map.setStyle(mapStyle);
    }

    /**
     * Determines the map style based on the user's color scheme preference.
     * 
     * @returns {void}
     */
    #determineMapStyle() {
        const DARK_STYLE = "/themes/dark.json";
        const LIGHT_STYLE = "https://tiles.openfreemap.org/styles/bright";

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
     * Fetches bus data from a file and returns an array of buses.
     * 
     * @param {string} csvUrl 
     * @returns {Array}
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
     * 
     * @param {string} csv A csv of bus data
     * @returns {Array} An array of BusData objects
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
     * Renders markers to the web map based on the current busData array.
     * 
     * @param {Number} scale Multiplier for each bus x and y value
     * @param {Number} offsetX Additional x offset
     * @param {Number} offsetY Additional y offset
     * @returns {void}
     */
    renderBusMarkers(scale, offsetX, offsetY) {
        this.#clearExistingMarkers();

        this.#busData.forEach(bus => {
            const transformedX = (bus.x * scale) + offsetX;
            const transformedY = (bus.y * scale) + offsetY;

            const popup = new maplibregl.Popup({ offset: 25 })
                .setText(`
                    Bus: ${bus.id} |||
                    X: ${bus.x} |||
                    Y: ${bus.y} |||
                    Long: ${transformedX} |||
                    Lat: ${transformedY} |||
                `);

            let markerColor = "#1433e6";

            const marker = new maplibregl.Marker({ color: markerColor })
                .setLngLat([transformedX, transformedY])
                .setPopup(popup)
                .addTo(this.#map);

            this.#activeMarkers.push(marker);
        });
    }

    #clearExistingMarkers() {
        this.#activeMarkers.forEach(marker => marker.remove());
        this.#activeMarkers.length = 0;
    }
}

customElements.define('map-x', Map);