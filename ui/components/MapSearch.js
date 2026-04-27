import { eventBus } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
//------------------------------------------------------------------------------------
/**
 * Allows the user to search for a specific marker within the web map.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class MapSearch extends HTMLElement {
    static styles = new CSSStyleSheet();

    connectedCallback() {
        this.classList.add('map-search');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
            <search class="map-search__container">
                <input class="map-search__input" type="search" placeholder="Search map...">
            </search>
        `;
    }

    #initialize() {
        const searchInput = this.querySelector('input');
        searchInput.addEventListener('keydown', (event) => this.#handleSearch(event));
    }

    /**
     * Validates the user's search query when the enter key is pressed, then emits a map search event.
     * @param {KeyboardEvent} event Keydown within search input.
     * @returns {void}
     */
    #handleSearch(event) {
        if (event.key !== 'Enter') {
            return;
        }

        const query = event.target.value.trim();

        if (query.length === 0) {
            return;
        }

        eventBus.emit(EVENTS.MAP_SEARCH_INITIATED, query);
    }
}

customElements.define('map-search', MapSearch);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
MapSearch.styles.replaceSync(/*css*/`
    .map-search__container {
        background-color: light-dark(var(--clr-slate-50), var(--clr-slate-900));
        border: 1px solid light-dark(var(--clr-slate-200), var(--clr-slate-700));
        border-radius: 100vmax;
        padding: 8px 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .map-search__input {
        width: 100%;
        border: none;
        background: transparent;
        padding-block: 4px;
        color: light-dark(var(--clr-slate-800), var(--clr-slate-200));
    }
`);

if (!document.adoptedStyleSheets.includes(MapSearch.styles)) {
    document.adoptedStyleSheets.push(MapSearch.styles);
}