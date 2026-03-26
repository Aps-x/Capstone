import { EVENT_BUS } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
//------------------------------------------------------------------------------------
/**
 * Allows the user to search for a specific marker within the web map.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class MapSearch extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('map-search');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
            <search>
                <input type="search" placeholder="Search map...">
            </search>
        `;
    }

    #initialize() {
        const searchInput = this.querySelector('input');
        searchInput.addEventListener('keydown', (event) => this.#handleSearch(event));
    }

    #handleSearch(event) {
        if (event.key !== 'Enter') {
            return;
        }

        const query = event.target.value.trim();

        if (query.length === 0) {
            return;
        }

        EVENT_BUS.emit(EVENTS.MAP_SEARCH_INITIATED, query);
    }
}

customElements.define('map-search', MapSearch);