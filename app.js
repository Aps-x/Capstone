import "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
import "./ui/Map/Map.js";
import "./ui/ControlPanel/ControlPanel.js";
import "./ui/MarkerPanel/MarkerPanel.js";
import { DATABASE } from './core/Database.js';
import { STORE_NAMES, STORE_CONFIGS} from './core/DatabaseConfig.js'
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

    async connectedCallback() {
        this.classList.add('app');
        this.setAttribute('role', 'main');

        try {
            await DATABASE.open(STORE_CONFIGS);
            this.#render(); 
        } 
        catch (error) {
            console.error("Failed to initialize app:", error);
            this.innerHTML = `<h2>Fatal Error: Could not connect to database.</h2>`;
        }
    }

    #render() {
        this.innerHTML = /*html*/`
            <control-panel></control-panel>
            <map-x></map-x>
            <marker-panel></marker-panel>
        `;
    }
}

customElements.define('app-x', App);