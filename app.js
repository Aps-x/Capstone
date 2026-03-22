import "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
import "./ui/Map/Map.js";
import "./ui/ControlPanel/ControlPanel.js";
import "./ui/MarkerControls/MarkerControls.js";
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
        this.setAttribute('role', 'main');
        this.#render();
    }

    #render() {
        this.innerHTML = /*html*/`
        <control-panel></control-panel>
        <map-x></map-x>
        <marker-controls></marker-controls>
        `;
    }
}

customElements.define('app-x', App);