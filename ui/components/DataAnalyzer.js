import { kmeans } from 'https://esm.sh/ml-kmeans@7.0.0';
import { database } from "../../core/Database.js";
import { OBJECT_STORES } from '../../core/ObjectStores.js';
import { eventBus } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
//------------------------------------------------------------------------------------
/**
 * Performs Data Analysis on the geojson data. Currently performs Kmeans analysis.
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class DataAnalyzer extends HTMLElement {
    static styles = new CSSStyleSheet();

    connectedCallback() {
        this.classList.add('data-analyzer');
        this.#render();
        this.#initialize();
    }

    #render() {
        this.innerHTML = /*html*/`
            <button type="button">Generate Control Centers</button>
        `;
    }

    #initialize() {
        const button = this.querySelector('button');

        button.addEventListener('click', (event) => this.#generateAndSaveKMeansClusters(event));
    }

    async #generateAndSaveKMeansClusters() {
        try {
            // 1. Fetch all spatial layers
            const spatialLayers = await database.getAll(OBJECT_STORES.SPATIAL_LAYERS);

            // 2. Filter for layers that contain at least one Point geometry
            const spatialLayersWithPoints = spatialLayers.filter(layer => {
                const features = layer.data?.features;

                if (!features) {
                    return false;
                }

                return features.some(feature => feature.geometry?.type === 'Point');
            });

            // 3. Ensure we actually found a layer before proceeding
            if (spatialLayersWithPoints.length === 0) {
                eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, "No spatial layers with point geometries found in the database.");
                console.warn("No spatial layers with point geometries found in the database.");
                return;
            }

            // 4. Extract coordinates
            const coordinates = [];
            const assignedNodes = [];

            spatialLayersWithPoints.forEach(layer => {
                layer.data.features.forEach(feature => {
                    if (feature.geometry?.type === 'Point') {
                        coordinates.push(feature.geometry.coordinates);
                        // Assuming the first property is the unique id
                        assignedNodes.push(Object.values(feature.properties)[0]);
                    }
                });
            });

            if (coordinates.length === 0) {
                console.warn("Failed to extract coordinates for clustering.");
                return;
            }

            console.log(assignedNodes);

            // 5. Run the K-Means clustering algorithm

            // NOTE:
            // Kmeans does not guarantee that there will always be 21 buses per control center
            // Some will have more, some will have less.
            const busesPerControlCenter = 21;

            // k = number of control centers to create.
            const k = Math.ceil(coordinates.length / busesPerControlCenter);
            const result = kmeans(coordinates, k);

            const nodesByCluster = Array.from({ length: k }, () => []);

            result.clusters.forEach((clusterIndex, dataIndex) => {
                // You can push just the coordinates, or the whole original feature
                // We'll push the whole feature so the control center knows everything about its nodes
                nodesByCluster[clusterIndex].push(assignedNodes[dataIndex]);
            });

            // 6. Format the centroids as a new GeoJSON FeatureCollection
            const controlCentersGeoJSON = {
                type: "FeatureCollection",
                features: result.centroids.map((centroid, index) => ({
                    type: "Feature",
                    properties: {
                        "Name": `0${index + 1}`,
                        "Longitude": `${centroid[0]}`,
                        "Latitude": `${centroid[1]}`,
                        "Type": "Control",
                        "AssignedNodes": nodesByCluster[index].join(', ') 
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [centroid[0], centroid[1]]
                    }
                }))
            };

            // 7. Save the newly created layer back to the database
            const timestamp = Date.now();

            await database.put(OBJECT_STORES.ANALYSIS_LAYERS, {
                fileName: `analysis_layer_${timestamp}.geojson`,
                data: controlCentersGeoJSON
            });

            eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, "Successfully generated control centers");
        }
        catch (error) {
            console.error("Failed to generate K-Means clusters:", error);
        }
    }
}

customElements.define('data-analyzer', DataAnalyzer);

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
DataAnalyzer.styles.replaceSync(/*css*/`

`);

if (!document.adoptedStyleSheets.includes(DataAnalyzer.styles)) {
    document.adoptedStyleSheets.push(DataAnalyzer.styles);
}