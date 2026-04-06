import "./lib/maplibre/maplibre-gl.js";
import "./ui/Map/Map.js";
import "./ui/ControlPanel/ControlPanel.js";
import "./ui/MarkerPanel/MarkerPanel.js";
import "./ui/Toaster/Toaster.js";
import { DATABASE } from './core/Database.js';
import { DATABASE_SCHEMA, OBJECT_STORES } from './core/DatabaseConfig.js'
//------------------------------------------------------------------------------------
/**
 * Application entry point.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class App extends HTMLElement {

    async connectedCallback() {
        this.classList.add('app');
        this.setAttribute('role', 'main');

        try {
            await DATABASE.open(DATABASE_SCHEMA);

            const hasVisited = localStorage.getItem('hasVisited');

            if (!hasVisited) {
                await this.#loadInitialData();

                localStorage.setItem('hasVisited', 'true');
            }

            this.#render();
        }
        catch (error) {
            console.error("Application could not start because an error occured when opening IndexedDB", error);
        }
    }

    #render() {
        this.innerHTML = /*html*/`
            <control-panel></control-panel>
            <map-x></map-x>
            <marker-panel></marker-panel>
            <toaster-x></toaster-x>
        `;
    }

    async #loadInitialData() {
        try {
            const linesResponse = await fetch('./data/lines.geojson');
            const linesData = await linesResponse.json();

            const pointsResponse = await fetch('./data/points.geojson');
            const pointsData = await pointsResponse.json();

            await DATABASE.put(OBJECT_STORES.SPATIAL_LAYERS, {
                fileName: 'lines.geojson',
                data: linesData
            });

            await DATABASE.put(OBJECT_STORES.SPATIAL_LAYERS, {
                fileName: 'points.geojson',
                data: pointsData
            });
        } 
        catch (error) {
            console.error("Failed to load data:", error);
        }
    }
}

customElements.define('app-x', App);