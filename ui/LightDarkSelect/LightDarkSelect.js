//------------------------------------------------------------------------------------
/**
 * Allows the user to set the color scheme of the website.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class LightDarkSelect extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('light-dark-select');
        this.#render();

        const selectElement = this.querySelector('select');

        // Check for saved preference
        let savedPreference = localStorage.getItem("color-scheme-preference");

        if (savedPreference == null) {
            savedPreference = "light dark";
        }

        selectElement.value = savedPreference;
        
        // Apply the initial scheme
        this.#applyScheme(savedPreference);

        // Listen for user changes
        selectElement.addEventListener('change', (event) => {
            const newScheme = event.target.value;
            localStorage.setItem("color-scheme-preference", newScheme);
            this.#applyScheme(newScheme);
        });
    }

    #render() {
        this.innerHTML = /*html*/`
        <label>Color Scheme:
            <select>
                <option value="light dark">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </label>
        `;
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
    }
}

customElements.define('light-dark-select', LightDarkSelect);