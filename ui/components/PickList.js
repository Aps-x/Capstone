import "./PickListItem.js";
//------------------------------------------------------------------------------------
/**
 * Form UI component. Dumb Component.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class PickList extends HTMLElement {
    static styles = new CSSStyleSheet();

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

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
PickList.styles.replaceSync(/*css*/`
    .pick-list {
        display: block;
    }
    .pick-list__fieldset {
        display: grid;
        background-color: light-dark(var(--clr-slate-50), var(--clr-slate-800));
        border: 1px solid light-dark(var(--clr-slate-200), var(--clr-slate-600));
        border-radius: 12px;
    }
    .pick-list__legend {
        margin-inline: auto;
        font-weight: var(--fw-medium);
        font-size: var(--fs-000);
    }
`);

if (!document.adoptedStyleSheets.includes(PickList.styles)) {
    document.adoptedStyleSheets.push(PickList.styles);
}