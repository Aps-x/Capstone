import "./lib/maplibre/maplibre-gl.js";
import "./ui/components/Map.js";
import "./ui/components/ControlPanel.js";
import "./ui/components/MarkerPanel.js";
import "./ui/components/Toaster.js";
import { DATABASE } from './core/Database.js';
import { DATABASE_SCHEMA, OBJECT_STORES } from './core/DatabaseConfig.js'
//------------------------------------------------------------------------------------
/**
 * Application entry point.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class App extends HTMLElement {
    static styles = new CSSStyleSheet();

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

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
App.styles.replaceSync(/*css*/`
    .app {
        display: grid;
        grid-template-rows: 100vh;
        grid-template-columns: 400px 1fr 400px;
        grid-template-areas: "left main right";
        max-height: 100vh;
        overflow: hidden;
    }
    @media only screen and (max-width: 768px) {
        .app {
            max-height: unset;
            grid-template-columns: 1fr;
            grid-template-rows: 33dvh 33dvh auto;
            grid-template-areas: "right" "main" "left";
        }
    }
`);

if (!document.adoptedStyleSheets.includes(App.styles)) {
    document.adoptedStyleSheets.push(App.styles);
}