import { database } from "../../core/Database.js";
import { EVENTS } from "../../core/Events.js";
import { eventBus } from "../../core/EventBus.js";
//------------------------------------------------------------------------------------
/**
 * Renders a list of spatial layers and handles UI interactions for the list.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class LayerList extends HTMLElement {
    static styles = new CSSStyleSheet();
    /** @type {string} */ #storeName;
    /** @type {HTMLUListElement} */ #list;
    /** @type {HTMLTemplateElement} */ #listItemTemplate;
    
    constructor() {
        super();

        this.#listItemTemplate = document.createElement('template');

        this.#listItemTemplate.innerHTML = /*html*/`
            <li class="layer-list__list-item">
                <p class="layer-list__file-text">
                    <span class="file-name"></span><span class="file-extension"></span>
                </p>
                <button-x data-classes="layer-list__button--download" data-type="secondary" type="button">
                    <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
                </button-x>

                <button-x data-classes="layer-list__button--delete" data-type="secondary" type="button">
                    <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-.081l-.919 11a3 3 0 0 1 -2.824 2.995l-.176 .005h-8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-.005 -.167l-.923 -11.083h-.08a1 1 0 0 1 -.117 -1.993l.117 -.007zm-10 4a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1" /><path d="M14 2a2 2 0 0 1 2 2a1 1 0 0 1 -1.993 .117l-.007 -.117h-4l-.007 .117a1 1 0 0 1 -1.993 -.117a2 2 0 0 1 1.85 -1.995l.15 -.005z" /></svg>
                </button-x>
            </li>
        `;

        eventBus.on(EVENTS.DATABASE_MUTATION, (event) => this.#handleDatabaseMutation(event));
    }

    connectedCallback() {
        this.classList.add('layer-list');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
            <ul class="layer-list__list" role="list"></ul>
        `;
    }

    async #initialize() {
        this.#storeName = this.dataset.store;

        if (!this.#storeName) {
            console.error("LayerList requires a 'data-store' attribute to initialize.");
            this.remove();
            return;
        }

        this.#list = this.querySelector('ul');
        this.#list.addEventListener('click', (event) => this.#delegateClickEvent(event));

        try {
            const layers = await database.getAll(this.#storeName);
            
            layers.forEach(layer => {
                this.#createListItem(layer, layer.id);
            });
        } 
        catch (error) {
            console.error("Failed to load layers on initialization:", error);
        }
    }

    /**
     * Creates a list item, attaches event listeners, and appends it to the DOM.
     * @param {Object} layer The layer object from IndexedDB.
     */
    #createListItem(layer, key) {
        const clone = this.#listItemTemplate.content.cloneNode(true);

        // Select elements from the cloned template
        const li = clone.querySelector('li');
        const downloadButton = clone.querySelector('button-x:nth-of-type(1)');
        const deleteButton = clone.querySelector('button-x:nth-of-type(2)');

        // Split the file name and insert it into the template
        const { name, extension } = this.#splitFileName(layer.fileName);

        li.querySelector('.file-name').textContent = name;
        li.querySelector('.file-extension').textContent = extension;

        li.dataset.id = key;

        downloadButton.setAttribute('aria-label', `Download ${layer.fileName}`);
        deleteButton.setAttribute('aria-label', `Delete ${layer.fileName}`);

        this.#list.appendChild(clone);
    }

    /**
     * Splits a filename from its file extension.
     * @param {string} fileName The file name of the spatial layer.
     * @returns {{ name: string, extension: string }}
     */
    #splitFileName(fileName) {
        const lastDotIndex = fileName.lastIndexOf('.');

        if (lastDotIndex > 0) {
            return {
                name: fileName.substring(0, lastDotIndex),
                extension: fileName.substring(lastDotIndex)
            };
        }
        return { name: fileName, extension: '' };
    }

    /**
     * Delegates click events triggered within the list element.
     * Identifies if a download or delete button was clicked and routes to the appropriate handler.
     * @param {MouseEvent} event - The standard DOM click event.
     */
    #delegateClickEvent(event) {
        const downloadButton = event.target.closest('.layer-list__button--download');
        const deleteButton = event.target.closest('.layer-list__button--delete');

        if (!downloadButton && !deleteButton) {
            return;
        }

        const li = event.target.closest('li');
        const layerId = li.dataset.id;

        if (deleteButton) {
            this.#handleDeleteButtonClicked(layerId);
        } 
        else if (downloadButton) {
            this.#handleDownloadButtonClicked(layerId);
        }
    }

    /**
     * Handles the download button interaction.
     * @param {string|number} layerId The ID of the layer to download.
     */
    async #handleDownloadButtonClicked(layerId) {
        try {
            const layer = await database.get(this.#storeName, Number(layerId));

            const blob = new Blob([JSON.stringify(layer.data)], { type: 'application/geo+json' });

            const url = URL.createObjectURL(blob);

            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = layer.fileName;

            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

            URL.revokeObjectURL(url);
        } 
        catch (error) {
            console.error("An error occurred while downloading the layer:", error);
        }
    }

    /**
     * Deletes the layer from the database and removes it from the UI.
     * @param {string} layerId Database auto-incremented id.
     */
    async #handleDeleteButtonClicked(layerId) {
        try {
            await database.delete(this.#storeName, Number(layerId));
            
            const li = this.#list.querySelector(`li[data-id="${layerId}"]`);

            if (li) {
                li.remove();
            }
        } 
        catch (error) {
            eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, "Failed to delete layer");
            console.error(`Failed to delete layer with ID ${layerId}:`, error);
        }
    }

    /**
     * Listens for database mutation events to keep the list synced.
     * @param {Event} event The mutation event containing layer data.
     */
    #handleDatabaseMutation(event) {
        if (!this.#list) {
            return;
        }
        
        const { action, storeName, key, item } = event.detail;
        
        if (storeName !== this.#storeName) {
            return;
        }

        if (action === 'put' && item) {
            this.#createListItem(item, key);
        } 
    }
}

customElements.define('layer-list', LayerList);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
LayerList.styles.replaceSync(/*css*/`
    .layer-list__list {
        display: grid;
        gap: 16px;
        margin-top: 18px;
    }
    .layer-list__list-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 6px;
    }
    .layer-list__file-text {
        align-self: center;
        display: flex;
        white-space: nowrap;
        overflow: hidden;
        max-width: 100%;
    }
    .layer-list__file-text>span {
        overflow: hidden;
        flex: 0 1 auto;
    }
    .layer-list__file-text > span:nth-child(1) {
        flex-shrink: 1;
        text-overflow: ellipsis;
    }
    .layer-list__file-text > span:nth-child(2) {
        min-width: -moz-fit-content;
        min-width: fit-content;
        flex: 1;
    }
`);

if (!document.adoptedStyleSheets.includes(LayerList.styles)) {
    document.adoptedStyleSheets.push(LayerList.styles);
}