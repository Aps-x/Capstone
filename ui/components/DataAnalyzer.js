import { kmeans } from '../../lib/kmeans/ml-kmeans.mjs';
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
            <button-x data-type="secondary">Generate Utility Nodes</button-x>
        `;
    }

    #initialize() {
        const button = this.querySelector('button');

        button.addEventListener('click', (event) => this.#generateAndSaveKMeansClusters(event));
    }

    async #generateAndSaveKMeansClusters() {
        try {
            eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, "Running K-Means clustering algorithm...");

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
            const sourceFeatureIds = [];

            spatialLayersWithPoints.forEach(layer => {
                layer.data.features.forEach(feature => {
                    if (feature.geometry?.type === 'Point') {
                        coordinates.push(feature.geometry.coordinates);
                        // Assuming the first property is the unique id
                        sourceFeatureIds.push(Object.values(feature.properties)[0]);
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

            const averagePointsPerUtilityNode = 21;
            const k = Math.ceil(coordinates.length / averagePointsPerUtilityNode);
            const kmeansResult = kmeans(coordinates, k);

            const sourceFeatureIdsByCluster = [];
            const coordinatesByCluster = []; // Track coordinates for line generation

            for (let i = 0; i < k; i++) {
                sourceFeatureIdsByCluster.push([]);
                coordinatesByCluster.push([]);
            }

            kmeansResult.clusters.forEach((clusterIndex, dataIndex) => {
                sourceFeatureIdsByCluster[clusterIndex].push(sourceFeatureIds[dataIndex]);
                coordinatesByCluster[clusterIndex].push(coordinates[dataIndex]);
            });

            // Format the centroids as a new GeoJSON FeatureCollection
            const utilityNodesGeoJSON = {
                type: "FeatureCollection",
                features: kmeansResult.centroids.map((centroid, index) => ({
                    type: "Feature",
                    properties: {
                        "Name": `0${index + 1}`,
                        "Longitude": `${centroid[0]}`,
                        "Latitude": `${centroid[1]}`,
                        "Type": "Utility",
                        "AssignedNodes": sourceFeatureIdsByCluster[index].join(', ') 
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [centroid[0], centroid[1]]
                    }
                }))
            };

            // Format the connection lines as a new GeoJSON FeatureCollection
            const connectionLinesGeoJSON = {
                type: "FeatureCollection",
                features: []
            };

            kmeansResult.centroids.forEach((centroid, index) => {
                const utilityNodeName = `0${index + 1}`;
                
                coordinatesByCluster[index].forEach((targetCoord, ptIndex) => {
                    connectionLinesGeoJSON.features.push({
                        type: "Feature",
                        properties: {
                            "Type": "UtilityConnection",
                            "SourceUtilityNode": utilityNodeName,
                            "TargetAssignedNode": sourceFeatureIdsByCluster[index][ptIndex]
                        },
                        geometry: {
                            type: "LineString",
                            coordinates: [
                                [centroid[0], centroid[1]], // Start at utility node
                                [targetCoord[0], targetCoord[1]] // End at assigned node
                            ]
                        }
                    });
                });
            });

            // Save the newly created layers back to the database
            const randomFileSuffix = Math.random().toString(36).substring(2, 10);

            // Save LineString layer (Connections)
            await database.put(OBJECT_STORES.SPATIAL_LAYERS, {
                fileName: `utility_connections_${randomFileSuffix}.geojson`,
                data: connectionLinesGeoJSON
            });

            // Save Point layer (Nodes)
            await database.put(OBJECT_STORES.SPATIAL_LAYERS, {
                fileName: `utility_nodes_${randomFileSuffix}.geojson`,
                data: utilityNodesGeoJSON
            });

            eventBus.emit(EVENTS.SYSTEM_MESSAGE_GENERATED, "Successfully Generated K-Means Clusters & Connection Lines");
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