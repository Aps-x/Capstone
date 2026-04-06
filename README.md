# Capstone Map
![](./docs/Screenshot.png)
## Project Overview

This project was sponsored by Dr. Ana Goulart as part of the University of Canberra's ITS Capstone Program. Our team was tasked with visualizing a dataset produced by the CSIRO -- a synthetic model of the Australian Eastern Power Grid.

Our solution is a fully client-side web application that accepts geojson spatial data and visualizes it on a web map. This solution aids users in improving their understanding of the dataset in a visual and accessible way.

## User Guide

1. Navigate to the website [here](https://aps-x.github.io/Capstone/)
2. Click 'Import Data'
3. Click 'Browse' and select your geojson data
4. Press the 'Apply' button
5. Et voilà, enjoy your visualized data!

Note: The synthetic NEM data is included by default on first visit.

## Developer Guide

1. Install the 'Visual Studio Code' IDE
2. Install the 'Live Server' extension by Ritwick Dey
3. Install the 'Live Sass Compiler' extension by Glenn Marks
4. Install 'Inline HTML' extension by pushqrdx
5. Clone the repo with your preferred method of using Git version control

## Architecture & Design

[![](./docs/ClassDiagram.svg)](./docs/ClassDiagram.svg)

### Technology Stack

| Category | Technology Used 
| :--- | :--- |
| **Markup** | HTML
| **Styling** | BEM CSS
| **Frontend** | JavaScript Custom Elements 
| **Database** | IndexedDB 
| **Infrastructure** | Github Pages & OpenFreeMap
| **Libraries** | MapLibre

#### Markup

Great care was taken to write semantic HTML because it makes the markup easier to read, improves accessibility, enhances search engine optimisation, and is simply the correct way to author websites.

#### Styling

I originally used a separate .scss file for each component, mimicking what MDN did for their web docs (yari). I later switched my approach to include the CSS within the component itself and then push the stylesheet to document.adoptedStylesheets. The BEM methodology was followed because it helps keep specificity low and organizes styles around components (i.e. blocks).

#### Frontend

JavaScript Custom Elements were used to organize our code around components. Web Components and the Shadow DOM were avoided because they prevent the use of utility classes and inheritance, they require workarounds to play nicely with forms and accessibility, and they just feel like they go against the grain of the web despite being a native API. JSDocs was used to help document the code. Here is an example custom element:

```javascript
import '../Button/Button.js';
import { EVENT_BUS } from '../../core/EventBus.js';
import { EVENTS } from '../../core/Events.js';
//------------------------------------------------------------------------------------
/**
 * User Interface for viewing information regarding a clicked marker / bus.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class MarkerPanel extends HTMLElement {
    /** @type {HTMLButtonElement} */ #closeButton;
    /** @type {HTMLDListElement} */ #descriptionList;

    constructor() {
        super();
        EVENT_BUS.on(EVENTS.MAP_MARKER_CLICKED, (event) => this.#handleMapMarkerClicked(event));
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

        if (markerProperties == null) {
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
        EVENT_BUS.emit(EVENTS.MARKER_PANEL_CLOSED);
    }
}

customElements.define('marker-panel', MarkerPanel);
```

#### Database

IndexedDB is used to handle the data that users can transfer to the website. It is a native, local solution that can handle gigabytes of data asynchronously without blocking the Event Loop. A simple wrapper was written around IndexedDB to make it usable with promises and async/await.

#### Infrastructure & Libraries

Github, OpenFreeMap, and MapLibre were chosen because they are free to use :)


## Acknowledgments

TODO: Ask mentor and sponsor if they want to be included here. CSIRO peeps for the dataset as well(?)

Special thanks to:

* Kevin Powell for the accessible accordion
* Josh Comeau for the cool 3D button
* Adam Argyle for the picklist and toast components
* Wes Bos for the center truncating text trick
* CJ (Coding Garden) for the MapLibre and OpenFreeMap example
* The entire web development community for being so awesome and open to sharing knowledge

## Appendix

[![](./docs/Performance.jpg)](https://www.youtube.com/watch?v=aWfYxg-Ypm4)