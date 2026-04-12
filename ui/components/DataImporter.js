import "./Button.js";
import "./LayerList.js";
import { database } from "../../core/Database.js";
import { OBJECT_STORES } from "../../core/DatabaseConfig.js";
import { eventBus } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
// ------------------------------------------------------------------------------------
/**
 * User interface and logic for allowing the user to enter and remove data.
 * @extends HTMLElement
 */
// ------------------------------------------------------------------------------------
class DataImporter extends HTMLElement {
    static styles = new CSSStyleSheet();
    /** @type {HTMLInputElement} */ #fileInput;
    /** @type {HTMLButtonElement} */ #browseButton; 
    /** @type {LayerList} */ #layerList;

    connectedCallback() {
        this.classList.add('data-importer');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
            <input class="data-importer__file-input" type="file" multiple accept=".geojson">
            <button-x data-type="secondary" type="button">Import Data Layers</button-x>
            <layer-list></layer-list>
        `;
    }

    async #initialize() {
        this.#fileInput = this.querySelector('.data-importer__file-input');
        this.#browseButton = this.querySelector('button'); 
        this.#layerList = this.querySelector('layer-list');

        this.#browseButton.addEventListener('click', (event) => this.#handleBrowseButtonClick(event));
        this.#fileInput.addEventListener('change', (event) => this.#handleFileSelection(event));
        this.#layerList.addEventListener('delete-layer', (event) => this.#handleDeleteLayer(event));

        this.#loadSavedSpatialLayers();
    }

    /**
     * Loads pre-existing spatial layers stored in IndexedDB.
     * @returns {void}
     */
    async #loadSavedSpatialLayers() {
        try {
            const layers = await database.getAll(OBJECT_STORES.SPATIAL_LAYERS);

            for (const layer of layers) {
                this.#layerList.createListItem(layer.fileName, layer.id);
            }
        } 
        catch (error) {
            console.error("Failed to load existing layers from database:", error);
        }
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
                if (geojsonData == null) {
                    console.warn(`Skipping ${file.name}: File is not valid JSON.`);
                    eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, `${file.name} is not valid JSON.`);
                    continue; 
                }

                if (geojsonData.features == null) {
                    console.warn(`Skipping ${file.name}: File is not valid GeoJSON.`);
                    eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, `${file.name} does not contain GeoJSON features.`);
                    continue;
                }

                const id = await database.put(OBJECT_STORES.SPATIAL_LAYERS, { 
                    fileName: file.name, 
                    data: geojsonData
                });

                this.#layerList.createListItem(file.name, id);
            } 
            catch (error) {
                console.error(`Failed to save ${file.name} to database:`, error);
                eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, `${file.name} is not valid JSON.`);
            }  
        }

        this.#fileInput.value = '';
    }   

    /**
     * Deletes a spatial layer from IndexedDB by ID and removes the corresponding list item.
     * @param {Event} event Delete layer event.
     */
    async #handleDeleteLayer(event) {
        const layerId = Number(event.detail.id);

        try {
            await database.delete(OBJECT_STORES.SPATIAL_LAYERS, layerId);
            this.#layerList.removeListItem(layerId);
        } 
        catch (error) {
            console.error(`Failed to delete layer ${layerId} from database:`, error);
            eventBus.emit(SYSTEM_MESSAGE_GENERATED, `Encountered an error when attempting to delete layer with id: ${layerId}`);
        }
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