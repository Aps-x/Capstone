//------------------------------------------------------------------------------------
/**
 * Models the user provided settings for the Map.
 */
//------------------------------------------------------------------------------------
export default class MapSettings {
    /**
     * @param {number} scale The scale factor of the map.
     * @param {number} xOffset Manual longitude offset.
     * @param {number} yOffset Manual latitude offset.
     * @param {boolean} shouldRenderPoints Determines if points should be drawn.
     * @param {boolean} shouldRenderLines Determines if lines should be drawn.
     * @param {boolean} shouldRenderHeatmap Determines if a heatmap should be drawn.
     */
    constructor(scale, xOffset, yOffset, shouldRenderPoints, shouldRenderLines, shouldRenderHeatmap) {
        this.scale = Number(scale);
        this.xOffset = Number(xOffset);
        this.yOffset = Number(yOffset);

        this.shouldRenderPoints = Boolean(shouldRenderPoints);
        this.shouldRenderLines = Boolean(shouldRenderLines);
        this.shouldRenderHeatmap = Boolean(shouldRenderHeatmap);
    }
}