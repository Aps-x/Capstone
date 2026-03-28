import "../Accordion/Accordion.js";
import "../ColorSchemeSelect/ColorSchemeSelect.js";
import "../Button/Button.js";
import "../DataImporter/DataImporter.js";
import "../MapSearch/MapSearch.js";
import { EVENT_BUS } from '../../core/EventBus.js';
import { EVENTS } from "../../core/Events.js";
import MapSettings from "../../core/MapSettings.js";
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
            <header class="control-panel__header">
                <h2 class="control-panel__title">Capstone Map</h2>
            </header>

            <div class="control-panel__content">

                <accordion-x data-title="Transform">
                    <form class="control-panel__form control-panel__form--transform">
                        <label class="control-panel__label">
                            <span class="control-panel__label-text">Scale</span>
                            <input class="control-panel__input" 
                                    type="number" 
                                    name="scale"  
                                    value="0.002" 
                                    step="0.00001">
                        </label>

                        <label class="control-panel__label">
                            <span class="control-panel__label-text">X Offset</span>
                            <input class="control-panel__input"
                                    type="number" 
                                    name="xOffset" 
                                    value="145" 
                                    step="0.1">
                        </label>

                        <label class="control-panel__label">
                            <span class="control-panel__label-text">Y Offset</span>
                            <input class="control-panel__input"
                                    type="number" 
                                    name="yOffset" 
                                    value="-30" 
                                    step="0.1">
                        </label>
                    </form>
                </accordion-x>

                <accordion-x data-title="Appearance">
                    <form class="control-panel__form control-panel__form--appearance">
                        <label class="control-panel__label">
                            <span class="control-panel__label-text">Points</span>
                            <input class="control-panel__input" type="checkbox" name="points" checked/>
                        </label>

                        <label class="control-panel__label">
                            <span class="control-panel__label-text">Lines</span>
                            <input class="control-panel__input" type="checkbox" name="lines" checked/>
                        </label>

                        <label class="control-panel__label">
                            <span class="control-panel__label-text">Heatmap</span>
                            <input class="control-panel__input" type="checkbox" name="heatmap" />
                        </label>

                        <color-scheme-select></color-scheme-select>
                    </form>
                </accordion-x>

                <accordion-x data-title="Generation Sources">
                    <form class="control-panel__form control-panel__form--generation">
                        <label class="control-panel__label">
                            <img src="./img/diesel.svg" alt="">
                            <span class="control-panel__label-text">Diesel</span>
                            <input class="control-panel__input" type="checkbox" name="diesel" />
                        </label>

                        <label class="control-panel__label">
                            <img src="./img/coal.svg" alt="">
                            <span class="control-panel__label-text">Coal</span>
                            <input class="control-panel__input" type="checkbox" name="coal" />
                        </label>

                        <label class="control-panel__label">
                            <img src="./img/wind.svg" alt="">
                            <span class="control-panel__label-text">Wind</span>
                            <input class="control-panel__input" type="checkbox" name="wind" />
                        </label>

                        <label class="control-panel__label">
                            <img src="./img/solar.svg" alt="">
                            <span class="control-panel__label-text">Solar</span>
                            <input class="control-panel__input" type="checkbox" name="solar" />
                        </label>

                        <label class="control-panel__label">
                            <img src="./img/gas.svg" alt="">
                            <span class="control-panel__label-text">Gas</span>
                            <input class="control-panel__input" type="checkbox" name="gas" />
                        </label>

                        <label class="control-panel__label">
                            <img src="./img/hydro.svg" alt="">
                            <span class="control-panel__label-text">Hydro</span>
                            <input class="control-panel__input" type="checkbox" name="hydro" />
                        </label>

                        <label class="control-panel__label">
                            <img src="./img/generator.svg" alt="">
                            <span class="control-panel__label-text">Generator</span>
                            <input class="control-panel__input" type="checkbox" name="generator" />
                        </label>
                    </form>
                </accordion-x>
            </div>

            <accordion-x data-title="Filter">
                <map-search></map-search>
            </accordion-x>

            <accordion-x data-title="Import Data">
                <form class="control-panel__form control-panel__form--data">
                    <data-importer></data-importer>
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
                <p>This project is <a href="https://github.com/Aps-x/Capstone">open source</a></p>
            <footer>
        `;
    }

    #initialize() {
        const submitButton = document.getElementById("control-panel-submit-button");
        
        submitButton.addEventListener('click', (event) => this.#handleFormSubmission(event));
    }

    /**
     * Assembles form data, creates a MapSettings DTO, and emits a MAP_SETTINGS_UPDATED event 
     * -- attaching the MapSettings DTO payload.
     * @param {Event} event Apply button clicked.
     * @returns {void}
     */
    #handleFormSubmission(event) {
        event.preventDefault();
        
        // Assemble form data
        const transfromData = new FormData(this.querySelector('.control-panel__form--transform'));
        const appearanceData = new FormData(this.querySelector('.control-panel__form--appearance'));

        // Create MapSettings data transfer object
        const mapSettings = new MapSettings(
            transfromData.get('scale'),
            transfromData.get('xOffset'),
            transfromData.get('yOffset'),
            appearanceData.get('points'),
            appearanceData.get('lines'),
            appearanceData.get('heatmap'),
        );

        // Signal that the map settings were updated and attach MapSettings DTO payload
        EVENT_BUS.emit(EVENTS.MAP_SETTINGS_UPDATED, mapSettings);
    }
}

customElements.define('control-panel', ControlPanel);