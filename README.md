# Capstone Map
![](./docs/Screenshot.png)
## Project Overview

This project was sponsored by Dr. Ana Goulart as part of the University of Canberra's ITS Capstone Program. Our team was tasked with visualizing a dataset produced by the CSIRO -- a synthetic model of the Australian Eastern Power Grid.

Our solution is a fully client-side web application that accepts GeoJSON spatial data and visualizes it on a web map. This solution aids users in improving their understanding of the dataset in a visual and accessible way.

## User Guide

### Quick Guide
1. Navigate to the website [here](https://aps-x.github.io/Capstone/)
2. Click 'Apply' to see the Synthetic NEM Data visualized
3. To see other datasets visualized, click 'Import Data'
4. Click 'Browse' and select your GeoJSON data
5. Press the 'Apply' button
6. Et voilà, enjoy your visualized data!

Note: The Synthetic NEM data is included by default on first visit. If you delete this data, you can find it in this repository within the data folder.

Alternatively, you can go to your browser settings > privacy > manage data, and then remove the local data for the website and refresh.

### In-Depth Guide

#### Appearance Section

* You can toggle whether lines or points are rendered in the 'Rendering Options' section. Click the 'Apply' button to update the map.
* When color scheme is set to auto, it will use the color scheme of your browser. You can manually change the color scheme to be light or dark.
* A legend for the line voltages is displayed here. For example: lines with a voltage greater than 500 kV are purple, greater than 330 kV are red, and greater than 275 kV are orange. Lines with the lowest voltage are green. Lines with no voltage data are grey.

#### Filter Section

* The 'Power Parameters' section consists of optional filters. If a field is left blank, then it is not considered.
* You can also toggle filters for generation sources and bus types.

#### Data Analysis Section

* Pressing the 'Generate Utility Nodes' button will perform k-means analysis and generate a new GeoJSON layer. There will be, on average, 21 buses per utility node. It is important to not that the k-means algorithm expects an integer for the number of groups to create. If the total number of buses divided by 21 is a float, it will be rounded up to the nearest integer, resulting in slightly more than 21 buses per utility node. All newly created utility nodes will be prefixed with '0'. Dashed lines will also be created between the new utility nodes and all the nodes in its cluster.

#### Search Section

* The search component will look at the first property of a feature to see if it matches the user's query.  
* When searching for text, the query is case-sensitive.
* The search component will search through all points, regardless of if they are currently rendered to the Map.
* If two points have the same ID, it will return the first point found.

#### Import Data Section

* This website only accepts GeoJSON. If you have a JSON file, you must ensure that it meets the [GeoJSON specification](https://geojson.org/) and has a .geojson file extension. There are numerous free online tools for converting CSV to GeoJSON.

## License

The Synthetic NEM dataset is licensed under CC-BY ([https://creativecommons.org/licenses/by/4.0/](https://creativecommons.org/licenses/by/4.0/)). More information on the Synthetic NEM dataset can be found here: [https://github.com/csiro-energy-systems/Synthetic-NEM-2000bus-Data](https://github.com/csiro-energy-systems/Synthetic-NEM-2000bus-Data).

## Acknowledgments

#### University of Canberra

Special thanks to Dr. Ana Goulart (Project Sponsor) and Jeanette Cotterill (Project Mentor) for their support and guidance over the course of this semester.

#### Academia

We would like to thank Frederik Geth, Ghulam Mohy Ud Din, and Matt Amos for sharing their expertise and helping us improve our understanding of the [Synthetic NEM dataset.](https://github.com/csiro-energy-systems/Synthetic-NEM-2000bus-Data).

* R. Heidari, M. Amos and F. Geth, "An Open Optimal Power Flow Model for the Australian National Electricity Market," 2023 IEEE PES Innovative Smart Grid Technologies - Asia (ISGT Asia), Auckland, New Zealand, 2023, pp. 1-5, doi: [10.1109/ISGTAsia54891.2023.10372618](https://doi.org/10.1109/ISGTAsia54891.2023.10372618)

* F. Arraño-Vargas and G. Konstantinou, "Modular Design and Real-Time Simulators Toward Power System Digital Twins Implementation," in IEEE Transactions on Industrial Informatics, doi: [10.1109/TII.2022.3178713](https://doi.org/10.1109/TII.2022.3178713)

* F. Arraño-Vargas and G. Konstantinou, "Synthetic Grid Modeling for Real-Time Simulations," 2021 IEEE PES Innovative Smart Grid Technologies - Asia (ISGT Asia), 2021, pp. 1-5, doi: [10.1109/ISGTAsia49270.2021.9715654](https://doi.org/10.1109/ISGTAsia49270.2021.9715654)

#### Web Development

* Kevin Powell for the [accordion](https://www.youtube.com/watch?v=B_n4YONte5A) component
* Josh Comeau for the [3D button](https://www.joshwcomeau.com/animation/3d-button/) component
* Adam Argyle for the [picklist](https://github.com/argyleink/gui-challenges/tree/main/picklists) and [toast](https://github.com/argyleink/gui-challenges/tree/main/toast) components
* Wes Bos for the center [truncating text trick](https://www.youtube.com/shorts/cuxbmq07Vxw)
* CJ (Coding Garden) for the [MapLibre and OpenFreeMap example](https://github.com/w3cj/openfreemap-examples/)
* Tabler.io for the [svg icons](https://tabler.io/icons)
* The entire web development community for being so awesome and open to sharing knowledge

## Developer Guide

### Setup Guide
1. Install the 'Visual Studio Code' IDE
2. Install the 'Live Server' extension by Ritwick Dey
3. Install 'Inline HTML' extension by pushqrdx
4. Install the 'Live Sass Compiler' extension by Glenn Marks
5. Clone the repo with your preferred method of using Git version control

### Architecture & Design

[![](./docs/ClassDiagram.svg)](./docs/ClassDiagram.svg)

### Technology Stack

| Category | Technology Used 
| :--- | :--- |
| **Markup** | HTML
| **Styling** | BEM CSS
| **Frontend** | JavaScript Custom Elements 
| **Database** | IndexedDB 
| **Infrastructure** | Github Pages & [OpenFreeMap](https://openfreemap.org/)
| **Libraries** | [MapLibre](https://github.com/maplibre/maplibre-gl-js), [Kmeans](https://github.com/mljs/kmeans)

#### Markup

Great care was taken to write semantic HTML because it makes the markup easier to read, improves accessibility, enhances search engine optimisation, and is simply the correct way to author websites.

#### Styling

I like to use the [BEM methodology ](https://getbem.com/) when writing my CSS. I think it is a great way of scoping your styles to components and their elements, whilst keeping specificity low, and it has the side effect of making your markup easier to read. An alternative approach would be to just use elements; use the custom element tag to scope your styles to that component and then use the :where() selector to keep specificity flat. But then, anything with a class would have a higher specificity, your styles would be dependent on a specific html structure, and you would miss out on having descriptive BEM names in your markup.

Another consideration is where you keep your CSS. I have opted for a Single-File Component approach, so the CSS for a component does not live in a separate file, but rather at the bottom of the same JavaScript file that the custom element component is defined. You could alternatively import a CSS module, but I prefer having everything relevant to a component in a single file and I like the simpler file structure.

Yet another consideration was whether or not to use design tokens, or a design system like [Brad Frost’s Atomic Design](https://atomicdesign.bradfrost.com/table-of-contents/). I decided that this project wasn’t large enough to benefit from these more complex development practices, but if this project was to grow past a single page, I would certainly recommend looking into this space.

I am personally a big fan of using [BEM and utility classes together](https://css-tricks.com/building-a-scalable-css-architecture-with-bem-and-utility-classes/). I think that they can complement each other like Yin and Yang. BEM covers components, their elements, and specific variants (Think primary or secondary button), whilst utility classes are great for applying styles to a single instance of a component i.e. exceptions to the rule. I did not end up using that many utility classes in this project, but they would certainly come in handy if the website was to grow and you had components that appeared in more than one context.


#### Frontend

JavaScript Custom Elements were used to organize the code around components. Web Components and the Shadow DOM were avoided because they prevent the use of utility classes and inheritance, they require workarounds to play nicely with forms and accessibility, and they just feel like they go against the grain of the web despite being a native API (in my opinion). JSDocs was used to help document the code.

I don't think a frontend framework would provide any advantage over this approach. A router is not required and there are only two parts of the website that are ‘reactive’: the LayerList and the MapLibre map. Both the LayerList and MapLibre Map listen to mutation events from IndexedDB, as opposed to listening for changes to variables using signals. If this website was to be extended with multiple pages that are highly interactive, then I would recommend converting this project to Vue.

Below is an example component.

```javascript
import './Button.js';
import { eventBus } from '../../core/EventBus.js';
import { EVENTS } from '../../core/Events.js';
//------------------------------------------------------------------------------------
/**
 * User Interface for viewing information regarding a clicked marker / bus.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class MarkerPanel extends HTMLElement {
    static styles = new CSSStyleSheet();
    /** @type {HTMLButtonElement} */ #closeButton;
    /** @type {HTMLDListElement} */ #descriptionList;

    constructor() {
        super();
        eventBus.on(EVENTS.MAP_MARKER_CLICKED, (event) => this.#handleMapMarkerClicked(event));
    }

    connectedCallback() {
        this.classList.add('marker-panel');
        this.setAttribute('role', 'complementary');
        this.setAttribute('aria-hidden', 'true')
        this.#render();
        this.#initialize();
    }
        
    #render() {
        this.innerHTML = /*html*/`
            <header class="marker-panel__header | order-swap">
                <h2 class="marker-panel__title">Marker Info</h2>

                <button-x data-type="secondary"
                        type="button" 
                        aria-label="Close marker controls">
                    <span aria-hidden="true">X</span>
                </button-x>
            </header>

            <dl class="marker-panel__table">
            </dl>
        `;
    }

    #initialize() {
        this.#descriptionList = this.querySelector('dl');
        this.#closeButton = this.querySelector('button');

        this.#closeButton.addEventListener('click', () => this.#closeMarkerPanel())
    }

    /**
     * Renders a description list of marker info when a marker is clicked.
     * @param {Event} event The click event
     * @returns {void}
     */
    #handleMapMarkerClicked(event) {
        this.setAttribute("aria-hidden", "false");

        const markerProperties = event.detail;

        if (!markerProperties) {
            console.warn("Map provided invalid marker properties to MarkerPanel");
        }

        this.#descriptionList.innerHTML = '';

        for (const [key, value] of Object.entries(markerProperties)) {
            const dt = document.createElement('dt');
            const dd = document.createElement('dd');

            dt.textContent = key;
            dd.textContent = value;
            
            dt.classList.add("marker-panel__key");
            dd.classList.add("marker-panel__value");

            this.#descriptionList.appendChild(dt);
            this.#descriptionList.appendChild(dd);
        }
    }

    /**
     * Toggles the visibility of the marker panel when the close button is clicked.
     * @returns {void}
     */
    #closeMarkerPanel() {
        this.setAttribute("aria-hidden", "true");
        eventBus.emit(EVENTS.MARKER_PANEL_CLOSED);
    }
}

customElements.define('marker-panel', MarkerPanel);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
MarkerPanel.styles.replaceSync(/*css*/`
    .marker-panel {
        display: none;
        grid-area: right;
        z-index: var(--z-sidebar);
        background-color: light-dark(var(--clr-white), var(--clr-slate-950));
        padding: 16px;
        padding-bottom: 64px;
        overflow: scroll;
        overflow-behavior: contain;
    }
    @media only screen and (max-width: 768px) {
        .marker-panel {
            border-radius: 0px 0px 12px 12px;
        }
    }
    .marker-panel[aria-hidden=false] {
        display: block;
        animation: appear 0.25s;
    }
    .marker-panel__header {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 16px;
    }
    .marker-panel__title {
        font-size: var(--fs-200);
        font-weight: var(--fw-semi-bold);
        color: light-dark(var(--clr-blue-500), var(--clr-blue-400));
        align-self: center;
    }
    .marker-panel__table {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin-top: 32px;
        border: 1px solid light-dark(var(--clr-slate-300), var(--clr-slate-700));
        border-radius: 8px;
        overflow: hidden;
    }
    .marker-panel__key {
        background-color: light-dark(var(--clr-slate-100), var(--clr-slate-900));
        font-weight: var(--fw-semi-bold);
        border-right: 1px solid light-dark(var(--clr-slate-300), var(--clr-slate-700));
    }
    .marker-panel__key::first-letter {
        text-transform: uppercase;
    }
    .marker-panel__value {
        background-color: light-dark(var(--clr-white), var(--clr-slate-800));
    }
    .marker-panel__key, .marker-panel__value {
        padding: 12px 16px;
        border-bottom: 1px solid light-dark(var(--clr-slate-300), var(--clr-slate-700));
        min-width: 0;
        overflow-wrap: break-word;
        align-content: center;
    }
    .marker-panel__key:last-of-type, .marker-panel__value:last-of-type {
        border-bottom: none;
    }

    @keyframes appear {
        from {
            transform: translateX(25vw);
        }
        to {
            transform: unset;
        }
    }
`);

if (!document.adoptedStyleSheets.includes(MarkerPanel.styles)) {
    document.adoptedStyleSheets.push(MarkerPanel.styles);
}
```
## Appendix

[![](./docs/Performance.jpg)](https://www.youtube.com/watch?v=aWfYxg-Ypm4)
