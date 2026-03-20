/**
 * Models a physical Bus unit and its spatial data.
 */
export default class Bus {
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