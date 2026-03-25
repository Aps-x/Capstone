import '../Button/Button.js';
import { EVENT_BUS } from '../../core/EventBus.js';
import { EVENTS } from '../../core/Events.js';
//------------------------------------------------------------------------------------
/**
 * User Interface for editing individual markers / buses and viewing their data.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class MarkerPanel extends HTMLElement {
    /** @type {HTMLButtonElement} */ #closeButton;
    /** @type {HTMLDListElement} */ #descriptionList;

    constructor() {
        super();
        EVENT_BUS.on(EVENTS.MAP_MARKER_CLICKED, (event) => this.#handleMapMarkerClicked(event));
    }

    connectedCallback() {
        this.classList.add('marker-panel');
        this.setAttribute('role', 'complementary');
        this.setAttribute('aria-hidden', 'true')
        this.#render();
        this.#initialize();
    }
        
    #render() {
        this.innerHTML = /*html*/`
        <header class="marker-panel__header | order-swap">
            <h2 class="marker-panel__title">Marker Controls</h2>

            <button-x data-type="secondary"
                    type="button" 
                    aria-label="Close marker controls">
                <span aria-hidden="true">X</span>
            </button-x>
        </header>

        <dl class="marker-panel__table">
        </dl>
        `;
    }

    #initialize() {
        this.#descriptionList = this.querySelector('dl');
        this.#closeButton = this.querySelector('button');

        this.#closeButton.addEventListener('click', (event) => this.#closeMarkerPanel(event))
    }

    #handleMapMarkerClicked(event) {
        this.setAttribute("aria-hidden", "false");

        const markerProperties = event.detail;

        if (markerProperties == null) {
            console.warn("Map provided invalid marker properties to MarkerPanel");
        }

        this.#descriptionList.innerHTML = '';

        for (const [key, value] of Object.entries(markerProperties)) {
            const dt = document.createElement('dt');
            dt.textContent = key;

            const dd = document.createElement('dd');
            dd.textContent = value;

            this.#descriptionList.appendChild(dt);
            this.#descriptionList.appendChild(dd);
        }
    }

    #closeMarkerPanel(event) {
        this.setAttribute("aria-hidden", "true");
    }
}

customElements.define('marker-panel', MarkerPanel);