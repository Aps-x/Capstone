import "./lib/maplibre/maplibre-gl.js";
import "./ui/Map/Map.js";
import "./ui/ControlPanel/ControlPanel.js";
import "./ui/MarkerPanel/MarkerPanel.js";
import { DATABASE } from './core/Database.js';
import { DATABASE_SCHEMA } from './core/DatabaseConfig.js'
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
            await DATABASE.open(DATABASE_SCHEMA);
            this.#render();
        } 
        catch (error) {
            console.error("Failed to initialize app:", error);
            this.innerHTML = /*html*/`
                <h2>Fatal Error: Could not connect to database.</h2>
            `;
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