//------------------------------------------------------------------------------------
/**
 * Button component. Dumb component with no logic.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class Button extends HTMLElement {
    static styles = new CSSStyleSheet();

    connectedCallback() {
        this.content = this.innerHTML;
        this.#render();
    }

    #render() {
        const { type = "", classes = "" } = this.dataset;

        // Get attributes from the custom element so they can be passed on to the button element
        const excludedAttributes = new Set(['data-type', 'data-classes', 'class']);

        const passedAttributes = Array.from(this.attributes)
            .filter(({ name }) => !excludedAttributes.has(name))
            .map(({ name, value }) => `${name}="${value}"`)
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

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
Button.styles.replaceSync(/*css*/`
    .button {
        display: block;
        position: relative;
        border: none;
        background: transparent;
        padding: 0px;
        cursor: pointer;
        outline-offset: 4px;
        transition: filter 250ms;
        max-width: -moz-fit-content;
        max-width: fit-content;
        font-size: var(--fs-050);
    }
    .button--primary {
        --_btn-clr-bg: var(--clr-blue-500);
        --_btn-clr-txt: var(--clr-white);
        --_btn-fw: var(--fw-500);
    }
    .button--secondary {
        border: 2px solid light-dark(var(--clr-blue-500), var(--clr-blue-400));
        color: light-dark(var(--clr-blue-500), var(--clr-blue-400));;
        font-weight: var(--fw-medium);
        padding: 6px 11px;
        border-radius: 12px;
    }
    .button--secondary:hover,
    .button--secondary:focus-visible {
        background-color: light-dark(var(--clr-blue-500), var(--clr-blue-400));
        color: var(--clr-white);
    }
    .button--secondary:active {
        background-color: color-mix(in srgb, var(--clr-blue-500), black 20%);
        border-color: color-mix(in srgb, var(--clr-blue-500), black 20%);
    }
    .button__front {
        display: block;
        position: relative;
        padding: 12px 32px;
        border-radius: 12px;
        font-weight: var(--_btn-fw);
        color: var(--_btn-clr-txt);
        background: var(--_btn-clr-bg);
        will-change: transform;
        transform: translateY(-4px);
        transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
    }
    .button__shadow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        background: hsla(0, 0%, 0%, 0.25);
        will-change: transform;
        transform: translateY(2px);
        transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
    }
    .button__edge {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        background: linear-gradient(to left, color-mix(in srgb, hsl(0, 0%, 20%) 70%, var(--_btn-clr-bg) 30%) 0%, color-mix(in srgb, hsl(0, 0%, 30%) 70%, var(--_btn-clr-bg) 30%) 8%, color-mix(in srgb, hsl(0, 0%, 30%) 70%, var(--_btn-clr-bg) 30%) 92%, color-mix(in srgb, hsl(0, 0%, 20%) 70%, var(--_btn-clr-bg) 30%) 100%);
    }
    .button:hover {
        filter: brightness(110%);
    }
    .button:hover .button__front {
        transform: translateY(-6px);
        transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
    }
    .button:active .button__front {
        transform: translateY(-2px);
        transition: transform 34ms;
    }
    .button:hover .button__shadow {
        transform: translateY(4px);
        transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
    }
    .button:active .button__shadow {
        transform: translateY(1px);
        transition: transform 34ms;
    }
    .button:focus:not(:focus-visible) {
        outline: none;
    }
`);

if (!document.adoptedStyleSheets.includes(Button.styles)) {
    document.adoptedStyleSheets.push(Button.styles);
}

