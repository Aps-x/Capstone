//------------------------------------------------------------------------------------
/**
 * Loads document fragments, such as html snippets or svgs, into the DOM.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class FragmentLoader extends HTMLElement {

    async connectedCallback() {
        const response = await fetch(this.getAttribute("src"));

        if (!response.ok) {
            this.remove();
            return;
        }

        const fragment = await response.text();
        this.outerHTML = fragment;
    }
}

customElements.define('fragment-loader', FragmentLoader);