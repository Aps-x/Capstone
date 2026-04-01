//------------------------------------------------------------------------------------
/**
 * Accordion component. Reveals content when the user clicks the trigger.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class Accordion extends HTMLElement {
    /** @type {HTMLButtonElement} */ #triggerButton;
    /** @type {HTMLDivElement} */ #content;
    static #idCounter = 0;
    #initialized = false;
    #id = 0;

    constructor() {
        super();
    }

    connectedCallback() {
        // This component should never be moved, but just in case, check if component is initialized.
        if (this.#initialized) {
            return;
        }

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
            <h3 class="accordion__header">
                <button class="accordion__trigger" 
                        type="button" 
                        aria-expanded="false" 
                        aria-controls="sect-${this.#id}" 
                        id="accordion-${this.#id}">

                    <span>${this.dataset.title}</span>
                    <svg class="accordion__arrow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="12"><path fill="none" stroke="currentColor" stroke-width="3" d="M1 1l8 8 8-8"/></svg>
                </button>
            </h3>

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

        this.#initialized = true;
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