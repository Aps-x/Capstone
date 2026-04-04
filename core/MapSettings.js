//------------------------------------------------------------------------------------
/**
 * Models the user provided settings for the Map.
 */
//------------------------------------------------------------------------------------
export default class MapSettings {
    /**
     * @param {boolean} renderPoints Determines if points should be drawn.
     * @param {boolean} renderLines Determines if lines should be drawn.
     * @param {boolean} renderHeatmap Determines if a heatmap should be drawn.
     * @param {number} vMax Maximum Nominal Voltage.
     * @param {number} vMin Minimum Nominal Voltage.
     * @param {number} pMax Maximum Power.
     * @param {number} pMin Minimum Power.
     * @param {number} qMax Maximum Reactive Power.
     * @param {number} qMin Minimum Reactive Power.
     * @param {boolean} showGeneration Show generation buses.
     * @param {boolean} showTransmission Show transmission buses.
     * @param {boolean} showDistribution Show distribution buses.
     */
    constructor(
        renderPoints, renderLines, renderHeatmap,
        vMax, vMin, pMax, pMin, qMax, qMin,
        showGeneration, showTransmission, showDistribution
    ) {
        // Appearance Settings
        this.renderPoints = Boolean(renderPoints);
        this.renderLines = Boolean(renderLines);
        this.renderHeatmap = Boolean(renderHeatmap);

        // Power Parameter Filters
        this.vMax = Number(vMax);
        this.vMin = Number(vMin);
        this.pMax = Number(pMax);
        this.pMin = Number(pMin);
        this.qMax = Number(qMax);
        this.qMin = Number(qMin);

        // Bus Type Filters
        this.showGeneration = Boolean(showGeneration);
        this.showTransmission = Boolean(showTransmission);
        this.showDistribution = Boolean(showDistribution);
    }
}