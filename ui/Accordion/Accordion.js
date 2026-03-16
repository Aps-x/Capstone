/**
 * Accordion component. Reveals content when the user clicks the trigger.
 * @extends HTMLElement
 */
class Accordion extends HTMLElement {
    static #idCounter = 0;
    #initialized = false;
    #id;

    constructor() {
        super();
    }

    connectedCallback() {
        if (this.#initialized === true) {
            return;
        }

        // Aria requires the use of Ids to make elements more accessible.
        // Each instance of an accordion cannot share the same Id.
        // This code allows for the accordion to generate a unique id.
        Accordion.#idCounter++;
        this.#id = Accordion.#idCounter;

        this.classList.add('accordion');

        // Rendering the accordion's HTML will replace any child content
        // This juggles the content before rendering, and then inserts the content.
        const slotContent = this.innerHTML;
        this.#render();
        this.querySelector("slot").innerHTML = slotContent;

        // Listens for a click event on the accordion and then toggles the content visiblity.
        const triggerButton = this.querySelector(".accordion__trigger");
        const content = this.querySelector(".accordion__content");

        triggerButton.addEventListener("click", () => {
            const isExpanded = triggerButton.getAttribute("aria-expanded") === "true";

            triggerButton.setAttribute("aria-expanded", String(!isExpanded));
            content.setAttribute("aria-hidden", String(isExpanded));
        });

        this.#initialized = true;
    }

    #render() {
        this.innerHTML = /*html*/`
        <article class="accordion__panel">
            <h3 class="accordion__header">
                <button class="accordion__trigger" 
                        type="button" 
                        aria-expanded="false" 
                        aria-controls="sect-${this.#id}" 
                        id="accordion-${this.#id}">

                    <span>${this.dataset.heading}</span>
                    <img class="accordion__arrow" src="../../img/icon-arrow.svg" alt="">
                    
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
        </article>
        `;
    }
}

customElements.define('accordion-x', Accordion);