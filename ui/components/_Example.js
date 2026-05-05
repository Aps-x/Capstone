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

    static {
        customElements.define('example-x', this);

        const styles = new CSSStyleSheet();
        styles.replaceSync(/*css*/`

        `);
        document.adoptedStyleSheets.push(styles);
    }
}