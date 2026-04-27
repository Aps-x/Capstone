import './Button.js';
import { eventBus } from '../../core/EventBus.js';
import { EVENTS } from '../../core/Events.js';
//------------------------------------------------------------------------------------
/**
 * User Interface for viewing information regarding a clicked marker / bus.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class MarkerPanel extends HTMLElement {
    static styles = new CSSStyleSheet();
    /** @type {HTMLButtonElement} */ #closeButton;
    /** @type {HTMLDListElement} */ #descriptionList;

    constructor() {
        super();
        eventBus.on(EVENTS.MAP_MARKER_CLICKED, (event) => this.#handleMapMarkerClicked(event));
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
                <h2 class="marker-panel__title">Marker Info</h2>

                <button-x data-type="secondary" type="button" aria-label="Close marker controls">
                    <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6.707 5.293l5.293 5.292l5.293 -5.292a1 1 0 0 1 1.414 1.414l-5.292 5.293l5.292 5.293a1 1 0 0 1 -1.414 1.414l-5.293 -5.292l-5.293 5.292a1 1 0 1 1 -1.414 -1.414l5.292 -5.293l-5.292 -5.293a1 1 0 0 1 1.414 -1.414" /></svg>
                </button-x>
            </header>

            <dl class="marker-panel__table">
            </dl>
        `;
    }

    #initialize() {
        this.#descriptionList = this.querySelector('dl');
        this.#closeButton = this.querySelector('button');

        this.#closeButton.addEventListener('click', () => this.#closeMarkerPanel())
    }

    /**
     * Renders a description list of marker info when a marker is clicked.
     * @param {Event} event The click event
     * @returns {void}
     */
    #handleMapMarkerClicked(event) {
        this.setAttribute("aria-hidden", "false");

        const markerProperties = event.detail;

        if (!markerProperties) {
            console.warn("Map provided invalid marker properties to MarkerPanel");
        }

        this.#descriptionList.innerHTML = '';

        for (const [key, value] of Object.entries(markerProperties)) {
            const dt = document.createElement('dt');
            const dd = document.createElement('dd');

            dt.textContent = key;
            dd.textContent = value;
            
            dt.classList.add("marker-panel__key");
            dd.classList.add("marker-panel__value");

            this.#descriptionList.appendChild(dt);
            this.#descriptionList.appendChild(dd);
        }
    }

    /**
     * Toggles the visibility of the marker panel when the close button is clicked.
     * @returns {void}
     */
    #closeMarkerPanel() {
        this.setAttribute("aria-hidden", "true");
        eventBus.emit(EVENTS.MARKER_PANEL_CLOSED);
    }
}

customElements.define('marker-panel', MarkerPanel);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
MarkerPanel.styles.replaceSync(/*css*/`
    .marker-panel {
        display: none;
        grid-area: marker-panel;
        z-index: var(--z-sidebar);
        background-color: light-dark(var(--clr-white), var(--clr-slate-950));
        padding: 16px;
        padding-bottom: 64px;
        overflow: scroll;
        overscroll-behavior: contain;
    }
    @media (max-width: 768px) {
        .marker-panel {
            border-radius: 0px 0px 12px 12px;
        }
    }
    .marker-panel[aria-hidden=false] {
        display: block;
        animation: appear 0.25s;
    }
    .marker-panel__header {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 16px;
    }
    .marker-panel__title {
        font-size: var(--fs-200);
        font-weight: var(--fw-semi-bold);
        color: light-dark(var(--clr-blue-500), var(--clr-blue-400));
        align-self: center;
    }
    .marker-panel__table {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin-top: 32px;
        border: 1px solid light-dark(var(--clr-slate-300), var(--clr-slate-700));
        border-radius: 8px;
        overflow: hidden;
    }
    .marker-panel__key {
        background-color: light-dark(var(--clr-slate-100), var(--clr-slate-900));
        font-weight: var(--fw-semi-bold);
        border-right: 1px solid light-dark(var(--clr-slate-300), var(--clr-slate-700));
    }
    .marker-panel__key::first-letter {
        text-transform: uppercase;
    }
    .marker-panel__value {
        background-color: light-dark(var(--clr-white), var(--clr-slate-800));
    }
    .marker-panel__key, .marker-panel__value {
        padding: 12px 16px;
        border-bottom: 1px solid light-dark(var(--clr-slate-300), var(--clr-slate-700));
        min-width: 0;
        overflow-wrap: break-word;
        align-content: center;
    }
    .marker-panel__key:last-of-type, .marker-panel__value:last-of-type {
        border-bottom: none;
    }

    @keyframes appear {
        from {
            transform: translateX(400px);
        }
        to {
            transform: translateX(0);
        }
    }

    @media (max-width: 768px) {
        @keyframes appear {
            from {
                transform: translateY(-40dvh);
            }
            to {
                transform: translateY(0);
            }
        }
    }
`);

if (!document.adoptedStyleSheets.includes(MarkerPanel.styles)) {
    document.adoptedStyleSheets.push(MarkerPanel.styles);
}