import "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
import "./ui/Map/Map.js";
import "./ui/MapControls/MapControls.js";

/**
 * Application entry point.
 * @extends HTMLElement
 */
class App extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('app');
        this.#render();
    }

    #render() {
        this.innerHTML = html`
            <map-x></map-x>
            <map-controls></map-controls>
            <marker-controls></marker-controls>
        `
    }
}

customElements.define('app-x', App);