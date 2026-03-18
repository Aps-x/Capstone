import "../Accordion/Accordion.js";
import "../LightDarkSelect/LightDarkSelect.js";

/**
 * User Interface for filtering the map, as well as importing and exporting data.
 * @extends HTMLElement
 */
export default class MapControls extends HTMLElement {
    #mapControlsForm = null;
    #map = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('map-controls');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
        <h2 class="map-controls__title">Map Controls</h2>
        <form class="map-controls__form">
            <accordion-x data-heading="Transform">
                <div class="map-controls__input-group">
                    <label>Scale: <input name="scale" type="number" value="0.002" step="0.00001"></label>
                    <label>X Offset: <input name="offsetX" type="number" value="145" step="0.1"></label>
                    <label>Y Offset: <input name="offsetY" type="number" value="-30" step="0.1"></label>
                </div>
            </accordion-x>

            <button type="submit">Apply</button>
        </form>
        <light-dark-select></light-dark-select>
        `;
    }

    #initialize() {
        // TODO: I don't think these need to be class level properties, but I'm tired rn...
        this.#mapControlsForm = this.querySelector('.map-controls__form');
        this.#map = document.querySelector('map-x');

        this.#mapControlsForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);

            const scale = Number(formData.get('scale'));
            const offsetX = Number(formData.get('offsetX'));
            const offsetY = Number(formData.get('offsetY'));

            this.#map.renderBusMarkers(scale, offsetX, offsetY);
        });
    }
}

customElements.define('map-controls', MapControls);