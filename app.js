import "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
import "./ui/Map/Map.js";
import "./ui/MapControls/MapControls.js"

class App extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('app');
        this.#render();
    }

    #render() {
        this.innerHTML = `
            <map-x></map-x>
            <map-controls></map-controls>
            <map-info></map-info>
        `
    }
}

customElements.define('app-x', App);
export default App;