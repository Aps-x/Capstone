//------------------------------------------------------------------------------------
/**
 * Description here
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class Example extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('example');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`

        `;
    }

    #initialize() {

    }
}

customElements.define('example-x', Example);