import "../Accordion/Accordion.js";
import "../ColorSchemeSelect/ColorSchemeSelect.js";
import "../Button/Button.js";
import "../FileImporter/FileImporter.js"
import { EVENT_BUS } from '../../core/EventBus.js';
import { EVENTS } from "../../core/Events.js";
//------------------------------------------------------------------------------------
/**
 * Primary user interface for interacting with the map.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
export default class ControlPanel extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('control-panel');
        this.setAttribute('role', 'complementary');
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
                <form class="control-panel__form control-panel__form--transform">
                    <label>Scale: <input type="number" name="scale"  value="0.002" step="0.00001"></label>
                    <label>X Offset: <input type="number" name="offsetX" value="145" step="0.1"></label>
                    <label>Y Offset: <input type="number" name="offsetY" value="-30" step="0.1"></label>
                </form>
            </accordion-x>

            <accordion-x data-title="Appearance">
                <form class="control-panel__form control-panel__form--appearance">
                    Heatmap or Points
                    <color-scheme-select></color-scheme-select>
                </form>
            </accordion-x>

            <accordion-x data-title="Generation Sources">
                <form class="control-panel__form control-panel__form--generation">
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
            <search>
                <form class="control-panel__form control-panel__form--filter">
                    <input type="search" placeholder="Search map...">
                </form>
            </search>
        </accordion-x>

        <accordion-x data-title="Import Data">
            <form class="control-panel__form control-panel__form--data">
                <file-importer></file-importer>
            </form>
        </accordion-x>

        <button-x id="control-panel-submit-button"
                data-type="primary" 
                data-classes="mx-auto"
                type="submit">Apply</button-x>

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

        // TODO: Add the others forms and create a MapConfig object
        const transformForm = this.querySelector('.control-panel__form--transform');
        const formData = new FormData(transformForm);

        EVENT_BUS.emit(EVENTS.MAP_SETTINGS_UPDATED, formData);
    }
}

customElements.define('control-panel', ControlPanel);