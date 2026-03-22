//------------------------------------------------------------------------------------
/**
 * Button component. Dumb component with no logic.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class Button extends HTMLElement {

    connectedCallback() {
        this.#render();
    }

    #render() {
        // TODO: Render different buttons based on dataset.type
        this.outerHTML = /*html*/`
        <button class="button | button--primary ${this.dataset.classes}" id="${this.dataset.id}">
            <span class="button__shadow"></span>
            <span class="button__edge"></span>
            <span class="button__front">${this.dataset.text}</span>
        </button>
        `;
    }
}

customElements.define('button-x', Button);