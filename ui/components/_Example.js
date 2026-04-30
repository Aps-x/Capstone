//------------------------------------------------------------------------------------
/**
 * Description here
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class Example extends HTMLElement {
    static styles = new CSSStyleSheet();

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

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
Example.styles.replaceSync(/*css*/`

`);

if (!document.adoptedStyleSheets.includes(Example.styles)) {
    document.adoptedStyleSheets.push(Example.styles);
}