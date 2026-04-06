//------------------------------------------------------------------------------------
/**
 * Data Transfer Object that describes the Map settings that can be provided by the user.
 */
//------------------------------------------------------------------------------------
export default class MapSettings {
    /**
     * @param {boolean} renderPoints Determines if points should be drawn.
     * @param {boolean} renderLines Determines if lines should be drawn.
     * @param {number|string|null} vMax Maximum Nominal Voltage.
     * @param {number|string|null} vMin Minimum Nominal Voltage.
     * @param {number|string|null} pMax Maximum Power.
     * @param {number|string|null} pMin Minimum Power.
     * @param {number|string|null} qMax Maximum Reactive Power.
     * @param {number|string|null} qMin Minimum Reactive Power.
     * @param {boolean} showGeneration Show generation buses.
     * @param {boolean} showTransmission Show transmission buses.
     * @param {boolean} showDistribution Show distribution buses.
     */
    constructor(
        renderPoints, renderLines,
        vMax, vMin, pMax, pMin, qMax, qMin,
        showGeneration, showTransmission, showDistribution
    ) {
        // Appearance Settings
        this.renderPoints = Boolean(renderPoints);
        this.renderLines = Boolean(renderLines);

        // Power Parameter Filters (Safely parsed)
        this.vMax = this.#parseOptionalNumber(vMax);
        this.vMin = this.#parseOptionalNumber(vMin);
        this.pMax = this.#parseOptionalNumber(pMax);
        this.pMin = this.#parseOptionalNumber(pMin);
        this.qMax = this.#parseOptionalNumber(qMax);
        this.qMin = this.#parseOptionalNumber(qMin);

        // Bus Type Filters
        this.showGeneration = Boolean(showGeneration);
        this.showTransmission = Boolean(showTransmission);
        this.showDistribution = Boolean(showDistribution);
    }

    /**
     * Safely parses a value into a Number. 
     * Returns undefined if the input is empty, whitespace, null, or invalid.
     * @param {any} value The value to parse
     * @returns {number | undefined}
     */
    #parseOptionalNumber(value) {
        if (value == null || (typeof value === 'string' && value.trim() === '')) {
            return undefined;
        }

        const parsedNumber = Number(value);
        
        return isNaN(parsedNumber) ? undefined : parsedNumber;
    }
}