import '../Button/Button.js';
//------------------------------------------------------------------------------------
/**
 * User Interface for editing individual markers / buses.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class MarkerPanel extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('marker-panel');
        this.setAttribute('role', 'aside');
        this.setAttribute('aria-live', 'polite');
        this.#render();
        this.addEventListener('click', (event) => this.#closeMarkerPanel(event))
    }

    #render() {
        // TODO: Change the order of button and h2 so that screen reader users can hear the title first.
        this.innerHTML = /*html*/`
        <header class="marker-panel__header">
            <button-x data-type="secondary">X <span class='visually-hidden'>Close</span></button-x>
            <h2>Marker</h2>
        </header>

        <dl class="marker-panel__table">
            <dt>Bus ID</dt>
            <dd>1</dd>

            <dt>Longitude</dt>
            <dd>145</dd>

            <dt>Latitude</dt>
            <dd>30</dd>

            <dt>Generation Type</dt>
            <dd>Wind</dd>
        </dl>
        `;
    }

    #closeMarkerPanel(event) {
        event.preventDefault();
        this.classList.add('hidden');
    }
}

customElements.define('marker-panel', MarkerPanel);