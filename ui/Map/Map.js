class Map extends HTMLElement {
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
        this.#busData = await this.#fetchBusData('./data/XY Position.csv');
    }

    #createMap() {
        this.#map = new maplibregl.Map({
            style: "https://tiles.openfreemap.org/styles/bright",
            center: this.#mapCenter,
            zoom: 4,
            container: this,
        });
    }

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

    #parseBusData(csvData) {
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',');

        const busIndex = headers.indexOf('BUS#');
        const xIndex = headers.indexOf('x');
        const yIndex = headers.indexOf('y');

        const parsedData = [];

        for (let i = 1; i < lines.length; i++) {
            // Skip empty lines
            if (!lines[i]) {
                continue;
            }

            const row = lines[i].split(',');

            parsedData.push({
                x: parseFloat(row[xIndex]),
                y: parseFloat(row[yIndex]),
                busNumber: row[busIndex]
            });
        }

        return parsedData;
    }

    renderBusMarkers(scale, offsetX, offsetY) {
        console.log("rendering");
        this.#clearExistingMarkers();

        this.#busData.forEach(bus => {
            const transformedX = (bus.x * scale) + offsetX;
            const transformedY = (bus.y * scale) + offsetY;

            const popup = new maplibregl.Popup({ offset: 25 })
                .setText(`
                    Bus: ${bus.busNumber} |||
                    X: ${bus.x} |||
                    Y: ${bus.y} |||
                    Long: ${transformedX} |||
                    Lat: ${transformedY} |||
                `);

            // This is just temporary. I chose to highlight these two nodes because they each
            // have a coordinate with a zero value, indicating that the origin point is near
            // these two markers.
            let markerColor = "#1433e6";

            if (bus.busNumber === '1107' || bus.busNumber === '1171') {
                markerColor = "#c91f1f";
            }

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
export default Map;