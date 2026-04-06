import "../PickListItem/PickListItem.js";
//------------------------------------------------------------------------------------
/**
 * Form UI component. Dumb Component.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class PickList extends HTMLElement {

    connectedCallback() {
        this.classList.add('pick-list');
        const slotContent = this.innerHTML;
        this.#render();
        this.querySelector("slot").outerHTML = slotContent;
    }

    #render() {
        this.innerHTML = /*html*/`
        <fieldset class="pick-list__fieldset">
            <legend class="pick-list__legend">${this.dataset.legend}</legend>
            <slot></slot> 
        </fieldset>
        `;
    }
}

customElements.define('pick-list', PickList);