import "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
import "./ui/Map/Map.js";
import "./ui/MapControls/MapControls.js";
import "./ui/MarkerControls/MarkerControls.js";
import "./ui/Accordion/Accordion.js";
import "./ui/LightDarkSelect/LightDarkSelect.js";
//------------------------------------------------------------------------------------
/**
 * Application entry point.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class App extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('app');
        this.#render();
    }

    #render() {
        this.innerHTML = /*html*/`
        <map-controls></map-controls>
        <map-x></map-x>
        <marker-controls></marker-controls>
        `;
    }
}

customElements.define('app-x', App);