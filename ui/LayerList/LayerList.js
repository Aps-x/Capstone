//------------------------------------------------------------------------------------
/**
 * Renders a list of spatial layers and handles UI interactions for the list.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class LayerList extends HTMLElement {
    /** @type {HTMLUListElement} */ #list;
    /** @type {HTMLTemplateElement} */ #listTemplate;

    constructor() {
        super();

        this.#listTemplate = document.createElement('template');

        this.#listTemplate.innerHTML = /*html*/`
            <li class="layer-list__list-item">
                <p class="layer-list__file-text">
                    <span class="file-name"></span><span class="file-extension"></span>
                </p>
                <button-x data-type="secondary" type="button">
                    <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-.081l-.919 11a3 3 0 0 1 -2.824 2.995l-.176 .005h-8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-.005 -.167l-.923 -11.083h-.08a1 1 0 0 1 -.117 -1.993l.117 -.007zm-10 4a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1" /><path d="M14 2a2 2 0 0 1 2 2a1 1 0 0 1 -1.993 .117l-.007 -.117h-4l-.007 .117a1 1 0 0 1 -1.993 -.117a2 2 0 0 1 1.85 -1.995l.15 -.005z" /></svg>
                </button-x>
            </li>
        `;
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

    #initialize() {
        this.#list = this.querySelector('ul');

        this.#list.addEventListener('click', (event) => this.#handleDeleteButtonClicked(event));
    }

    /**
     * Dispatches a custom event intended for the DataImporter to listen to and delete the
     * relevant layer.
     * @param {Event} event Delete button clicked.
     * @returns {void}
     */
    #handleDeleteButtonClicked(event) {
        const deleteBtn = event.target.closest('button');
            
        if (deleteBtn && deleteBtn.dataset.layerId) {
            this.dispatchEvent(new CustomEvent('delete-layer', {
                detail: { id: deleteBtn.dataset.layerId },
                bubbles: true, 
            }));
        }
    }

    /**
     * Removes a list item from the DOM based on its layerId.
     * @param {string|number} layerId Database auto-incremented id.
     * @returns {void}
     */
    removeListItem(layerId) {
        const li = this.#list.querySelector(`li[data-id="${layerId}"]`);

        if (li) {
            li.remove();
        }
    }

    /**
     * Creates a list item and appends it to the unordered list.
     * @param {string} layerName The file name of the spatial layer.
     * @param {string|number} layerId The auto-incremented database ID.
     */
    createListItem(layerName, layerId) {
        const clone = this.#listTemplate.content.cloneNode(true);

        const li = clone.querySelector('li');
        const deleteButton = clone.querySelector('button-x');

        const { name, extension } = this.#splitFileName(layerName);

        li.dataset.id = layerId;
        li.querySelector('.file-name').textContent = name;
        li.querySelector('.file-extension').textContent = extension;

        deleteButton.setAttribute('aria-label', `Delete ${layerName}`);
        deleteButton.dataset.layerId = layerId;

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
}

customElements.define('layer-list', LayerList);