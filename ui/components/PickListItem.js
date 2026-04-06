//------------------------------------------------------------------------------------
/**
 * Input for a pick list form UI group. Dumb Component.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class PickListItem extends HTMLElement {
    static styles = new CSSStyleSheet();

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

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
PickListItem.styles.replaceSync(/*css*/`
    .pick-list-item {
        --space: 16px;
    }
    .pick-list-item:where(:not(:last-of-type)) {
        border-bottom: 1px solid light-dark(var(--clr-slate-200), var(--clr-slate-600));
    }
    .pick-list-item__label {
        display: grid;
        align-items: center;
        gap: calc(var(--space) * 1.5);
        grid-auto-flow: column;
        grid-template-columns: auto 1fr;
        padding: var(--space);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }
    .pick-list-item__label:is(:focus-within, :hover) .pick-list-item__title {
        color: var(--clr-blue-500);
    }
    .pick-list-item__input[type=checkbox] {
        margin-inline: calc(var(--space) * 1.5);
    }
    .pick-list-item__input {
        max-width: 100px;
        padding-inline: 0.25em;
    }
    .pick-list-item__content {
        display: grid;
    }
    .pick-list-item__title {
        font-weight: var(--fw-semi-bold);
    }
    .pick-list-item__description {
        color: vvar(--clr-slate-600);
    }
`);

if (!document.adoptedStyleSheets.includes(PickListItem.styles)) {
    document.adoptedStyleSheets.push(PickListItem.styles);
}