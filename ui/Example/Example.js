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
    }

    #render() {
        this.innerHTML = /*html*/`

        `;
    }
}

customElements.define('example-x', Example);