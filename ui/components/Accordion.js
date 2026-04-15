import "./FragmentLoader.js";
//------------------------------------------------------------------------------------
/**
 * Accordion component. Reveals content when the user clicks the trigger.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class Accordion extends HTMLElement {
    static styles = new CSSStyleSheet();
    static #idCounter = 0;
    #id = 0;
    /** @type {HTMLButtonElement} */ #triggerButton;
    /** @type {HTMLDivElement} */ #content;

    connectedCallback() {
        this.classList.add('accordion');
        this.setAttribute('role', 'article');

        // Generate a unique Id for each accordion for Aria accessibility.
        // Custom elements don't automatically scope their ids like web components.
        // But the shadow DOM breaks aria labeling, so swings and roundabouts.
        Accordion.#idCounter++;
        this.#id = Accordion.#idCounter;

        // Rendering the accordion's HTML will replace any child content
        // This juggles the content before rendering.
        const slotContent = this.innerHTML;
        this.#render();
        this.querySelector("slot").outerHTML = slotContent;

        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
            <h2 class="accordion__header">
                <button class="accordion__trigger" 
                        type="button" 
                        aria-expanded="false" 
                        aria-controls="sect-${this.#id}" 
                        id="accordion-${this.#id}">

                    <div>
                        <fragment-loader src="${this.dataset.image || ''}"></fragment-loader>
                        <span>${this.dataset.title}</span>
                    </div>
                    <svg class="accordion__arrow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="12"><path fill="none" stroke="currentColor" stroke-width="3" d="M1 1l8 8 8-8"/></svg>
                </button>
            </h2>

            <div class="accordion__content" 
                    id="sect-${this.#id}" 
                    role="region" 
                    aria-labelledby="accordion-${this.#id}" 
                    aria-hidden="true">
                <div>
                    <slot>

                    </slot>
                </div>
            </div>
        `;
    }

    #initialize() {
        this.#triggerButton = this.querySelector(".accordion__trigger");
        this.#content = this.querySelector(".accordion__content");

        this.#triggerButton.addEventListener("click", () => this.#toggleAccordionContentVisibility());
    }

    /**
     * Toggles the visibility of the accordion's content.
     * @returns {void}
     */
    #toggleAccordionContentVisibility() {
        const isExpanded = this.#triggerButton.getAttribute("aria-expanded") === "true";

        this.#triggerButton.setAttribute("aria-expanded", String(!isExpanded));
        this.#content.setAttribute("aria-hidden", String(isExpanded));
    }
}

customElements.define('accordion-x', Accordion);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
Accordion.styles.replaceSync(/*css*/`
    .accordion {
        margin-top: 64px;
    }
    .accordion__trigger {
        display: grid;
        grid-template-columns: repeat(2, auto);
        justify-items: start;
        align-items: center;
        width: 100%;
        padding-block: 24px;
        font-weight: var(--fw-medium);
        font-size: var(--fs-050);
        border: none;
        background-color: unset;
        text-align: left;
        cursor: pointer;
    }
    .accordion__trigger:hover,
    .accordion__trigger:focus-visible {
        color: light-dark(var(--clr-blue-500), var(--clr-blue-300));
    }
    .accordion__trigger[aria-expanded=true] .accordion__arrow {
        transform: rotate(180deg);
    }
    .accordion__arrow {
        transition: transform 300ms ease-in-out;
        justify-self: end;
    }
    .accordion__content {
        display: grid;
        grid-template-rows: 0fr;
        transition: all 350ms;
        visibility: hidden;
    }
    .accordion__content[aria-hidden=false] {
        grid-template-rows: 1fr;
        padding-bottom: 16px;
        visibility: visible;
    }
    .accordion__content[aria-hidden=false] > div {
        animation: reveal-overflow 350ms forwards;
    }
    .accordion__content > div {
        overflow: hidden;
    }

    @keyframes reveal-overflow {
        0%, 99% {
            overflow: hidden;
        }
        100% {
            overflow: visible;
        }
    }
`);

if (!document.adoptedStyleSheets.includes(Accordion.styles)) {
    document.adoptedStyleSheets.push(Accordion.styles);
}