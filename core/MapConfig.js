//------------------------------------------------------------------------------------
/**
 * Models the configuration data required for the Map.
 */
//------------------------------------------------------------------------------------
export default class MapConfig {
    // TODO: Define this later...
    /**
     * @param {number} id Bus number with area prefix.
     * @param {number} longitude X value.
     * @param {number} latitude Y value.
     */
    constructor(id, longitude, latitude) {
        this.id = id;
        this.longitude = longitude;
        this.latitude = latitude;
    }
}