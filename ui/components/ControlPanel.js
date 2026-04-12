import "./Accordion.js";
import "./ColorSchemeSelect.js";
import "./Button.js"
import "./DataImporter.js";
import "./MapSearch.js";
import "./PickList.js";
import { eventBus } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
import MapSettings from "../../core/MapSettings.js";
//------------------------------------------------------------------------------------
/**
 * Primary user interface for interacting with the map.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
export default class ControlPanel extends HTMLElement {
    static styles = new CSSStyleSheet();

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
                                data-description="Maximum Nominal Voltage in kilovolts (kV)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="vMin" 
                                data-title="V Min"
                                data-description="Minimum Nominal Voltage in kilovolts (kV)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="pMax" 
                                data-title="P Max"
                                data-description="Maximum Power in megawatts (MW)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="pMin" 
                                data-title="P Min"
                                data-description="Minimum Power in megawatts (MW)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="qMax" 
                                data-title="Q Max"
                                data-description="Maximum Reactive Power in megavolt-amperes reactive (Mvar)">
                            </pick-list-item>

                            <pick-list-item
                                data-type="input"
                                data-name="qMin" 
                                data-title="Q Min"
                                data-description="Minimum Reactive Power in megavolt-amperes reactive (Mvar)">
                            </pick-list-item>
                        </pick-list>

                        <pick-list data-legend="Bus Types">
                            <pick-list-item
                                data-type="checkbox"
                                data-name="generation" 
                                data-title="Show Generation Buses"
                                checked>
                            </pick-list-item>

                            <pick-list-item
                                data-type="checkbox"
                                data-name="transmission" 
                                data-title="Show Transmission Buses"
                                data-description="A bus with a Nominal Voltage (V) over 35 kV, and not a generator."
                                checked>
                            </pick-list-item>
                            
                            <pick-list-item
                                data-type="checkbox"
                                data-name="distribution" 
                                data-title="Show Distribution Buses"
                                data-description="A bus with a Nominal Voltage (V) under 35 kV, and not a generator."
                                checked>
                            </pick-list-item>
                        </pick-list>

                        <pick-list data-legend="Generation Sources">
                            <pick-list-item
                                data-type="checkbox"
                                data-name="coal"
                                data-image="./img/coal.svg"
                                data-title="Show Coal"
                                checked>
                            </pick-list-item>

                            <pick-list-item
                                data-type="checkbox"
                                data-name="gas"
                                data-image="./img/gas.svg"
                                data-title="Show Gas"
                                checked>
                            </pick-list-item>
                            
                            <pick-list-item
                                data-type="checkbox"
                                data-name="hydro"
                                data-image="./img/hydro.svg"
                                data-title="Show Hydro"
                                checked>
                            </pick-list-item>

                            <pick-list-item
                                data-type="checkbox"
                                data-name="wind"
                                data-image="./img/wind.svg"
                                data-title="Show Wind"
                                checked>
                            </pick-list-item>

                            <pick-list-item
                                data-type="checkbox"
                                data-name="solar"
                                data-image="./img/solar.svg"
                                data-title="Show Solar"
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
            filterData.get('distribution'),

            filterData.get('coal'),
            filterData.get('gas'),
            filterData.get('hydro'),
            filterData.get('wind'),
            filterData.get('solar'),
        );

        // Signal that the map settings were updated and attach MapSettings DTO payload
        eventBus.emit(EVENTS.MAP_SETTINGS_UPDATED, mapSettings);
    }
}

customElements.define('control-panel', ControlPanel);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
ControlPanel.styles.replaceSync(/*css*/`
    .control-panel {
        z-index: var(--z-sidebar);
        grid-area: left;
        overflow: scroll;
        background-color: light-dark(var(--clr-white), var(--clr-slate-950));
    }
    .control-panel__header {
        grid-template-columns: auto 1fr;
        font-size: var(--fs-200);
        color: light-dark(var(--clr-blue-500), var(--clr-blue-400));
        background-color: light-dark(var(--clr-slate-50), var(--clr-slate-900));
        padding-block: 32px;
        padding-inline: 16px;
        text-align: center;
        border-radius: 0px 0px 14px 14px;
        --_shadow-color: 0deg 0% 63%;
        --_shadow-elevation-low:
            0px 1px 1.1px hsl(var(--_shadow-color) / 0.34),
            0px 1.7px 1.9px -1.2px hsl(var(--_shadow-color) / 0.34),
            0px 4px 4.5px -2.5px hsl(var(--_shadow-color) / 0.34);
        box-shadow: none;
    }
    html:has(meta[name=color-scheme][content=light]) .control-panel__header {
        box-shadow: var(--_shadow-elevation-low);
    }
    @media (prefers-color-scheme: light) {
        html:has(meta[name=color-scheme][content="light dark"]) .control-panel__header {
            box-shadow: var(--_shadow-elevation-low);
        }
    }
    .control-panel__title {
        display: inline;
        font-weight: var(--fw-medium);
        color: light-dark(var(--clr-slate-700), var(--clr-white));
    }
    .control-panel__content {
        margin: 16px;
    }
    .control-panel__footer {
        margin-block: 48px;
        padding: 16px;
    }
`);

if (!document.adoptedStyleSheets.includes(ControlPanel.styles)) {
    document.adoptedStyleSheets.push(ControlPanel.styles);
}