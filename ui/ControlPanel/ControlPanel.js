import "../Accordion/Accordion.js";
import "../LightDarkSelect/LightDarkSelect.js";
import "../Button/Button.js";
//------------------------------------------------------------------------------------
/**
 * Primary user interface for interacting with the map.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
export default class ControlPanel extends HTMLElement {
    /** @type {Map} */
    #map;

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('control-panel');
        this.setAttribute('role', 'aside');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
        <header>
            <h2 class="control-panel__title">Map Controls</h2>
        </header>

        <div class="control-panel__content">

            <accordion-x data-title="Transform">
                <form class="control-panel__form | control-panel__form--transform">
                    <label>Scale: <input type="number" name="scale"  value="0.002" step="0.00001"></label>
                    <label>X Offset: <input type="number" name="offsetX" value="145" step="0.1"></label>
                    <label>Y Offset: <input type="number" name="offsetY" value="-30" step="0.1"></label>
                </form>
            </accordion-x>

            <accordion-x data-title="Appearance">
                <form>Heatmap or Points</form>
                <light-dark-select></light-dark-select>
            </accordion-x>

            <accordion-x data-title="Generation Sources">
                <form class="control-panel__form | control-panel__form--generation">
                    <label>
                        <img src="./img/diesel.svg" alt="">
                        Diesel 
                        <input type="checkbox" name="diesel" />
                    </label>

                    <label>
                        <img src="./img/coal.svg" alt="">
                        Coal 
                        <input type="checkbox" name="coal" />
                    </label>

                    <label>
                        <img src="./img/wind.svg" alt="">
                        Wind 
                        <input type="checkbox" name="wind" />
                    </label>

                    <label>
                        <img src="./img/solar.svg" alt="">
                        Solar 
                        <input type="checkbox" name="solar" />
                    </label>

                    <label>
                        <img src="./img/gas.svg" alt="">
                        Gas 
                        <input type="checkbox" name="gas" />
                    </label>

                    <label>
                        <img src="./img/hydro.svg" alt="">
                        Hydro 
                        <input type="checkbox" name="hydro" />
                    </label>

                    <label>
                        <img src="./img/generator.svg" alt="">
                        Generator 
                        <input type="checkbox" name="generator" />
                    </label>
                </form>
            </accordion-x>
        </div>

        <accordion-x data-title="Filter">
            <form class="control-panel__form | control-panel__form--filter">
                <input type="search" placeholder="Search map...">
            </form>
        </accordion-x>

        <accordion-x data-title="Import Data">
            <form class="control-panel__form | control-panel__form--data">
                <input type="file" name="mapData" accept=".json, .csv">
            </form>
        </accordion-x>

        <button-x data-id="control-panel-submit-button" data-text="Apply" data-classes="mx-auto"></button-x>

        <footer class="flow my-7">
            <p>Project developed as part of the University of Canberra's ITS Capstone Program.</p>
            <p>
                <a href="https://maplibre.org/" target="_blank">MapLibre</a> | 
                <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> 
                <a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a> Data from 
                <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>
            </p>
        <footer>
        `;
    }

    #initialize() {
        this.#map = document.querySelector('map-x');

        const submitButton = document.getElementById("control-panel-submit-button");

        submitButton.addEventListener('click', (event) => this.#handleFormSubmission(event));
    }

    /**
     * Creates the formData object and signals the Map to render the bus markers.
     * 
     * @param {event} event
     * @returns {void}
     */
    #handleFormSubmission(event) {
        event.preventDefault();

        const transformForm = this.querySelector('.control-panel__form--transform');

        // TODO: Add the others forms and create a MapConfig object, refactor renderbusmarkers
        const formData = new FormData(transformForm);

        const scale = Number(formData.get('scale'));
        const offsetX = Number(formData.get('offsetX'));
        const offsetY = Number(formData.get('offsetY'));

        this.#map.renderBusMarkers(scale, offsetX, offsetY);
    }
}

customElements.define('control-panel', ControlPanel);