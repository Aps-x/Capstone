import "./Button.js";
import { database } from "../../core/Database.js";
import { OBJECT_STORES } from "../../core/ObjectStores.js";
import { eventBus } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
// ------------------------------------------------------------------------------------
/**
 * User interface and logic for allowing the user to add geojson data to IndexedDB.
 * @extends HTMLElement
 */
// ------------------------------------------------------------------------------------
class DataImporter extends HTMLElement {
    static styles = new CSSStyleSheet();
    /** @type {HTMLInputElement} */ #fileInput;
    /** @type {HTMLButtonElement} */ #browseButton; 

    connectedCallback() {
        this.classList.add('data-importer');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
            <input class="data-importer__file-input" type="file" multiple accept=".geojson">
            <button-x data-type="secondary" type="button">Import Data</button-x>
        `;
    }

    async #initialize() {
        this.#fileInput = this.querySelector('input');
        this.#browseButton = this.querySelector('button'); 

        this.#fileInput.addEventListener('change', (event) => this.#handleFileSelection(event));
        this.#browseButton.addEventListener('click', (event) => this.#handleBrowseButtonClick(event));
    }

    /**
     * Programatically clicks the hidden file input to open the native file browser.
     * @param {Event} event Browse button clicked.
     */
    #handleBrowseButtonClick(event) {
        event.preventDefault();
        this.#fileInput.click();
    }

    /**
     * Loops over selected files and enters them into the database.
     * @param {Event} event User selected file(s) to upload.
     * @returns {void}
     */
    async #handleFileSelection(event) {
        const selectedFiles = Array.from(event.target.files);

        if (selectedFiles.length === 0) {
            return;
        }

        for (const file of selectedFiles) {
            try {
                // Parse the text content
                const fileText = await file.text();
                const geojsonData = JSON.parse(fileText);

                // Validation
                if (!geojsonData) {
                    console.warn(`Skipping ${file.name}: File is not valid JSON.`);
                    eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, `${file.name} is not valid JSON.`);
                    continue; 
                }

                if (!geojsonData.features) {
                    console.warn(`Skipping ${file.name}: File is not valid GeoJSON.`);
                    eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, `${file.name} does not contain GeoJSON features.`);
                    continue;
                }

                await database.put(OBJECT_STORES.SPATIAL_LAYERS, { 
                    fileName: file.name, 
                    data: geojsonData
                });
            } 
            catch (error) {
                console.error(`Failed to save ${file.name} to database:`, error);
                eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, `Failed to save ${file.name} to database`);
            }  
        }

        this.#fileInput.value = '';
    }
}

customElements.define('data-importer', DataImporter);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
DataImporter.styles.replaceSync(/*css*/`
    .data-importer__file-input {
        display: none;
    }
`);

if (!document.adoptedStyleSheets.includes(DataImporter.styles)) {
    document.adoptedStyleSheets.push(DataImporter.styles);
}