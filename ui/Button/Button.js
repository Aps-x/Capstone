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
        const { type = "", classes = "" } = this.dataset;

        // Not the most elegant solution, but this gets attributes from the enclosing custom element
        // tag without replacing data-type or data-classes.
        const passedAttributes = Array.from(this.attributes)
            .filter(attr => !['data-type', 'data-classes', 'class'].includes(attr.name))
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(' ');

        switch (type) {
        case "primary":
            this.outerHTML = /*html*/`
            <button class="button button--primary | ${classes}" ${passedAttributes}>
                <span class="button__shadow"></span>
                <span class="button__edge"></span>
                <span class="button__front">${this.content}</span>
            </button>
            `;
            break;

        case "secondary":
        default:
            this.outerHTML = /*html*/`
            <button class="button button--secondary | ${classes}" ${passedAttributes}>
                ${this.content}
            </button>
            `;
            break;

            // Open to being extended with more button types.
        }
    }
}

customElements.define('button-x', Button);