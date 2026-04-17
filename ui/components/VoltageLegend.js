//------------------------------------------------------------------------------------
/**
 * Legend that explains the voltage lines. Dumb component.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class VoltageLegend extends HTMLElement {
    static styles = new CSSStyleSheet();

    connectedCallback() {
        this.classList.add('voltage-legend');
        this.#render();
    }

    #render() {
        this.innerHTML = /*html*/`
            <h3 class="voltage-legend__title">Line Voltage</h3>
            <ul class="voltage-legend__list">
                <li class="voltage-legend__item">
                    <span class="voltage-legend__color-line" style="background-color: #9c27b0;"></span>
                    <span class="voltage-legend__label">500 kV</span>
                </li>
                <li class="voltage-legend__item">
                    <span class="voltage-legend__color-line" style="background-color: #f44336;"></span>
                    <span class="voltage-legend__label">330 kV</span>
                </li>
                <li class="voltage-legend__item">
                    <span class="voltage-legend__color-line" style="background-color: #ff9800;"></span>
                    <span class="voltage-legend__label">275 kV</span>
                </li>
                <li class="voltage-legend__item">
                    <span class="voltage-legend__color-line" style="background-color: #ffeb3b;"></span>
                    <span class="voltage-legend__label">220 kV</span>
                </li>
                <li class="voltage-legend__item">
                    <span class="voltage-legend__color-line" style="background-color: #2196F3;"></span>
                    <span class="voltage-legend__label">110 - 132 kV</span>
                </li>
                <li class="voltage-legend__item">
                    <span class="voltage-legend__color-line" style="background-color: #4caf50;"></span>
                    <span class="voltage-legend__label">66 kV</span>
                </li>
            </ul>
        `;
    }
}

customElements.define('voltage-legend', VoltageLegend);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
VoltageLegend.styles.replaceSync(/*css*/`
    .voltage-legend {
        display: block;
    }
    .voltage-legend__title {
        font-size: var(--fs-050);
        font-weight: var(--fw-semi-bold);
    }
    .voltage-legend__list {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .voltage-legend__item {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .voltage-legend__color-line {
        display: inline-block;
        width: 24px;
        height: 6px;    
    }
    .voltage-legend__label {
        color: light-dark(var(--clr-slate-800), var(--clr-slate-100));
    }
`);

if (!document.adoptedStyleSheets.includes(VoltageLegend.styles)) {
    document.adoptedStyleSheets.push(VoltageLegend.styles);
}