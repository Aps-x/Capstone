//------------------------------------------------------------------------------------
/**
 * Imports files
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class FileImporter extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('file-importer');
        this.#render();
    }

    #render() {
        this.innerHTML = /*html*/`
        <input type="file" name="file">
        `;
    }
}

customElements.define('file-importer', FileImporter);