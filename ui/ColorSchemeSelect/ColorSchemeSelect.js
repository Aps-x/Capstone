import { EVENT_BUS } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
//------------------------------------------------------------------------------------
/**
 * Allows the user to set the color scheme of the website.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class ColorSchemeSelect extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('color-scheme-select');
        this.#render();

        const selectElement = this.querySelector('select');

        // Check for saved preference
        let colorSchemePreference = localStorage.getItem("color-scheme-preference");

        if (colorSchemePreference == null) {
            colorSchemePreference = "light dark";
        }

        selectElement.value = colorSchemePreference;
        
        // Apply the initial color scheme
        this.#applyScheme(colorSchemePreference);

        // Listen for changes to color scheme
        selectElement.addEventListener('change', (event) => this.#handleColorSchemePreferenceChange(event));
    }

    #render() {
        this.innerHTML = /*html*/`
            <label>
                <span>Color Scheme:</span>
                <select>
                    <option value="light dark">Auto</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </label>
        `;
    }

    /**
     * Handles a change in the user's color scheme preference.
     * 
     * @param {event} event 
     */
    #handleColorSchemePreferenceChange(event) {
        const newScheme = event.target.value;
        localStorage.setItem("color-scheme-preference", newScheme);
        this.#applyScheme(newScheme);
    }

    /**
     * Sets the content of the color-scheme meta tag.
     * 
     * @param {"light" | "dark" | "light dark"} scheme - The preferred color theme.
     * @returns {void}
     */
    #applyScheme(scheme) {
        const colorSchemeMetaTag = document.querySelector('meta[name="color-scheme"]');
        
        if (colorSchemeMetaTag == null) {
            return;
        }

        colorSchemeMetaTag.content = scheme;

        EVENT_BUS.emit(EVENTS.COLOR_SCHEME_UPDATED, scheme);
    }
}

customElements.define('color-scheme-select', ColorSchemeSelect);