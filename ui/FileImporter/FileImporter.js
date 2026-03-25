import "../Button/Button.js";
import { DATABASE } from "../../core/Database.js";
// ------------------------------------------------------------------------------------
/**
 * Imports files
 * @extends HTMLElement
 */
// ------------------------------------------------------------------------------------
// TODO: Change name to DataImporter
class FileImporter extends HTMLElement {
    /** @type {HTMLInputElement} */ #fileInput;
    /** @type {HTMLButtonElement} */ #browseButton;
    /** @type {HTMLUListElement} */ #fileList;
    #storeName = 'imported_files';

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('file-importer');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
        <input class="file-importer__file-input" type="file" multiple accept=".json, .csv">

        <button-x data-type="secondary" type="button">Browse...</button-x>

        <ul class="file-importer__file-list" role="list">

        </ul>
        `;
    }

    async #initialize() {
        this.#fileInput = this.querySelector('.file-importer__file-input');
        this.#browseButton = this.querySelector('button'); 
        this.#fileList = this.querySelector('.file-importer__file-list');

        this.#browseButton.addEventListener('click', (event) => this.#handleBrowseButtonClick(event));
        this.#fileInput.addEventListener('change', (event) => this.#handleFileSelection(event));

        await this.#loadSavedFiles();
    }

    async #loadSavedFiles() {
        try {
            const files = await DATABASE.getAll(this.#storeName);

            for (const item of files) {
                this.#createFileListItem(item.file.name, item.id);
            }
        } 
        catch (error) {
            console.error("Failed to load existing files from database:", error);
        }
    }

    #handleBrowseButtonClick(event) {
        event.preventDefault();
        this.#fileInput.click();
    }

    async #handleFileSelection(event) {
        // Converting the FileList object to an array allows us to use array methods
        const selectedFiles = Array.from(event.target.files);

        if (selectedFiles.length === 0) {
            return;
        }

        for (const file of selectedFiles) {
            try {
                // Create a unique ID and store the native File object
                const fileId = `${file.name}-${Date.now()}`;
                
                await DATABASE.put(this.#storeName, { 
                    id: fileId, 
                    file: file
                });
                
                this.#createFileListItem(file.name, fileId);
            } 
            catch (error) {
                console.error(`Failed to save ${file.name} to database:`, error);
            }
        }

        // Clear the input value so the user can select the same file again if they delete it
        this.#fileInput.value = '';
    }

    #createFileListItem(fileName, fileId) {
        const li = document.createElement('li');
        li.dataset.fileId = fileId;
        
        // Add the file name text
        const textNode = document.createTextNode(fileName + " ");
        li.appendChild(textNode);

        // Create the delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = /*html*/`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-.081l-.919 11a3 3 0 0 1 -2.824 2.995l-.176 .005h-8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-.005 -.167l-.923 -11.083h-.08a1 1 0 0 1 -.117 -1.993l.117 -.007zm-10 4a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1" /><path d="M14 2a2 2 0 0 1 2 2a1 1 0 0 1 -1.993 .117l-.007 -.117h-4l-.007 .117a1 1 0 0 1 -1.993 -.117a2 2 0 0 1 1.85 -1.995l.15 -.005z" /></svg>
        `;
        deleteButton.type = 'button';
        
        // Add the delete logic
        deleteButton.addEventListener('click', async () => {
            try {
                await DATABASE.delete(this.#storeName, fileId);
                li.remove();
            } 
            catch (error) {
                console.error(`Failed to delete ${fileName} from database:`, error);
            }
        });

        li.appendChild(deleteButton);
        this.#fileList.appendChild(li);
    }
}

customElements.define('file-importer', FileImporter);