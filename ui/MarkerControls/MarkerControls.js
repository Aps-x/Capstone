//------------------------------------------------------------------------------------
/**
 * User Interface for editing individual markers / buses.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class MarkerControls extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('marker-controls');
        this.#render();
    }

    #render() {
        this.innerHTML = /*html*/`
        
        `;
    }
}

customElements.define('marker-controls', MarkerControls);