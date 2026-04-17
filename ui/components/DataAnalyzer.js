import { kmeans } from 'https://esm.sh/ml-kmeans@7.0.0';
import { database } from "../../core/Database.js";
import { OBJECT_STORES } from '../../core/ObjectStores.js';
import { eventBus } from "../../core/EventBus.js";
import { EVENTS } from "../../core/Events.js";
//------------------------------------------------------------------------------------
/**
 * Performs Data Analysis on the geojson data. Currently just performs Kmeans analysis.
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
            <button-x data-type="secondary">Generate Control Centers</button-x>
        `;
    }

    #initialize() {
        const button = this.querySelector('button');

        button.addEventListener('click', (event) => this.#generateAndSaveKMeansClusters(event));
    }

    async #generateAndSaveKMeansClusters() {
        try {
            const spatialLayers = await database.getAll(OBJECT_STORES.SPATIAL_LAYERS);

            // Filter for layers that contain at least one Point geometry
            const spatialLayersWithPoints = spatialLayers.filter(layer => {
                const features = layer.data?.features;

                if (!features) {
                    return false;
                }

                return features.some(feature => feature.geometry?.type === 'Point');
            });

            // Ensure we actually found a layer before proceeding
            if (spatialLayersWithPoints.length === 0) {
                eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, "No spatial layers with point geometries found in the database.");
                console.warn("No spatial layers with point geometries found in the database.");
                return;
            }

            // Extract coordinates
            const coordinates = [];
            const nodeIds = [];

            spatialLayersWithPoints.forEach(layer => {
                layer.data.features.forEach(feature => {
                    if (feature.geometry?.type === 'Point') {
                        coordinates.push(feature.geometry.coordinates);
                        // Assuming the first property is the unique id
                        nodeIds.push(Object.values(feature.properties)[0]);
                    }
                });
            });

            if (coordinates.length === 0) {
                console.warn("Failed to extract coordinates for clustering.");
                return;
            }

            //
            // Run the K-Means clustering algorithm
            //

            // NOTE:
            // K-means cares about distance, not equal group sizes.
            // There will be, on average, 21 buses per control center**
            // Some will have more, some will have less. Sometimes with signifcant disparities.
            //
            // ** kmeans requires integers, so we round up the number. This means that there will
            // be slightly more than 21 buses per control center on average.
            const busesPerControlCenter = 21;

            // k = number of control centers to create.
            const k = Math.ceil(coordinates.length / busesPerControlCenter);
            const result = kmeans(coordinates, k);

            const nodesByCluster = Array.from({ length: k }, () => []);

            result.clusters.forEach((clusterIndex, dataIndex) => {
                // You can push just the coordinates, or the whole original feature
                // We'll push the whole feature so the control center knows everything about its nodes
                nodesByCluster[clusterIndex].push(nodeIds[dataIndex]);
            });

            // Format the centroids as a new GeoJSON FeatureCollection
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

            // Save the newly created layer back to the database
            const randomString = Math.random().toString(36).substring(2, 10);

            await database.put(OBJECT_STORES.SPATIAL_LAYERS, {
                fileName: `control_centers_${randomString}.geojson`,
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