//------------------------------------------------------------------------------------
/**
 * Input for a pick list form UI group.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class PickListItem extends HTMLElement {

    connectedCallback() {
        this.classList.add('pick-list-item');
        this.#render();
    }

    #render() {
        const isChecked = this.hasAttribute('checked') ? 'checked' : '';

        this.innerHTML = /*html*/`
            <label class="pick-list-item__label">
                <input class="pick-list-item__input" type="${this.dataset.type}" name="${this.dataset.name}" ${isChecked}>

                <span class="pick-list-item__content">
                    <b class="pick-list-item__title">${this.dataset.title}</b>
                    ${this.dataset.description ? `<span class="pick-list-item__description">${this.dataset.description}</span>` : ''}
                </span>
            </label>
        `;
    }
}

customElements.define('pick-list-item', PickListItem);