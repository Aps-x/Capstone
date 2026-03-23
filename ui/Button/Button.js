//------------------------------------------------------------------------------------
/**
 * Button component. Dumb component with no logic.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class Button extends HTMLElement {

    connectedCallback() {
        this.content = this.innerHTML;
        this.#render();
    }

    #render() {
        const { type= "", classes = "" } = this.dataset;

        switch (type) {

        case "primary":
            this.outerHTML = /*html*/`
            <button class="button button--primary | ${classes}">
                <span class="button__shadow"></span>
                <span class="button__edge"></span>
                <span class="button__front">${this.content}</span>
            </button>
            `;
            break;

        case "secondary":
        default:
            this.outerHTML = /*html*/`
            <button class="button button--secondary | ${classes}">${this.content}</button>
            `;
            break;

        // Open to be extended with more button types. If you do, might want to change the default buttom(?)
        }
    }
}

customElements.define('button-x', Button);