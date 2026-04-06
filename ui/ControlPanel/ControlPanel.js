import "../Accordion/Accordion.js";
import "../ColorSchemeSelect/ColorSchemeSelect.js";
import "../Button/Button.js";
import "../DataImporter/DataImporter.js";
import "../MapSearch/MapSearch.js";
import "../PickList/PickList.js";
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

    connectedCallback() {
        this.classList.add('control-panel');
        this.setAttribute('role', 'complementary');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
            <header class="control-panel__header">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-map-2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5" /><path d="M9 4v13" /><path d="M15 7v5.5" /><path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879" /><path d="M19 18v.01" /></svg>
                <h1 class="control-panel__title">Capstone Map</h1>
            </header>

            <div class="control-panel__content">

                <accordion-x data-title="Appearance" data-image="./img/palette.svg">
                    <form id="form--appearance" class="flow" style="--flow-spacer: 32px;">
                        <pick-list data-legend="Rendering Options">
                            <pick-list-item
                                data-type="checkbox"
                                data-name="points" 
                                data-title="Render Points"
                                checked>
                            </pick-list-item>

                            <pick-list-item
                                data-type="checkbox"
                                data-name="lines" 
                                data-title="Render Lines"
                                checked>
                            </pick-list-item>
                        </pick-list>

                        <color-scheme-select></color-scheme-select>
                    </form>
                </accordion-x>

                <accordion-x data-title="Filter" data-image="./img/filter.svg">
                    <form id="form--filter" class="flow" style="--flow-spacer: 32px;">
                        <pick-list data-legend="Power Parameters">
                            <pick-list-item
                                data-type="input"
                                data-name="vMax" 
                                data-title="V Max"
                                data-description="Maximum Nominal Voltage in Kilo Volts (KV)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="vMin" 
                                data-title="V Min"
                                data-description="Minimum Nominal Voltage in Kilo Volts (KV)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="pMax" 
                                data-title="P Max"
                                data-description="Maximum Power in MegaWatts (MW)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="pMin" 
                                data-title="P Min"
                                data-description="Minimum Power in MegaWatts (MW)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="qMax" 
                                data-title="Q Max"
                                data-description="Maximum Reactive power in MVolt-Ampere Reactive (MVar)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="qMin" 
                                data-title="Q Min"
                                data-description="Minimum Reactive power in MVolt-Ampere Reactive (MVar)">
                            </pick-list-item>
                        </pick-list>

                        <pick-list data-legend="Bus Types">
                            <pick-list-item
                                data-type="checkbox"
                                data-name="generation" 
                                data-title="Show Generator Buses"
                                checked>
                            </pick-list-item>

                            <pick-list-item
                                data-type="checkbox"
                                data-name="transmission" 
                                data-title="Show Transmission Buses"
                                data-description="A bus with a Nominal Voltage (V) over 35 KV, and not a generator."
                                checked>
                            </pick-list-item>
                            
                            <pick-list-item
                                data-type="checkbox"
                                data-name="distribution" 
                                data-title="Show Distribution Buses"
                                data-description="A bus with a Nominal Voltage (V) under 35 KV, and not a generator."
                                checked>
                            </pick-list-item>
                        </pick-list>
                    </form>
                </accordion-x>

                <accordion-x data-title="Search" data-image="./img/search.svg">
                    <map-search></map-search>
                </accordion-x>

                <accordion-x data-title="Import Data" data-image="./img/stack.svg">
                    <data-importer></data-importer>
                </accordion-x>
            </div>

            <button-x id="control-panel-submit-button"
                    data-type="primary" 
                    data-classes="mx-auto"
                    type="submit">Apply</button-x>

            <footer class="control-panel__footer | flow">
                <p>This <a href="https://github.com/Aps-x/Capstone">open source</a> project was developed as part of the University of Canberra's ITS Capstone Program.</p>
                <p>
                    <a href="https://maplibre.org/" target="_blank">MapLibre</a> | 
                    <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> 
                    <a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a> Data from 
                    <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap.</a>
                </p>
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
        
        const appearanceData = new FormData(this.querySelector('#form--appearance'));
        const filterData = new FormData(this.querySelector('#form--filter'));

        // Create MapSettings data transfer object
        const mapSettings = new MapSettings(
            appearanceData.get('points'),
            appearanceData.get('lines'),
            
            filterData.get('vMax'),
            filterData.get('vMin'),
            filterData.get('pMax'),
            filterData.get('pMin'),
            filterData.get('qMax'),
            filterData.get('qMin'),

            filterData.get('generation'),
            filterData.get('transmission'),
            filterData.get('distribution')
        );

        console.log(mapSettings);

        // Signal that the map settings were updated and attach MapSettings DTO payload
        EVENT_BUS.emit(EVENTS.MAP_SETTINGS_UPDATED, mapSettings);
    }
}

customElements.define('control-panel', ControlPanel);