//------------------------------------------------------------------------------------
/**
 * Loads document fragments, such as html snippets or svgs, into the DOM.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class FragmentLoader extends HTMLElement {

    async connectedCallback() {
        const source = this.getAttribute("src");

        if (!source) {
            this.remove();
            return;
        }

        const response = await fetch(source);

        if (!response.ok) {
            this.remove();
            return;
        }

        const fragment = await response.text();
        this.outerHTML = fragment;
    }
}

customElements.define('fragment-loader', FragmentLoader);