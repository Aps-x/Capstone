import { OBJECT_STORES } from "./ObjectStores.js";
//------------------------------------------------------------------------------------
/**
 * Database schema configuration.
 * @type {Array<Object>}
 */
//------------------------------------------------------------------------------------
export const DATABASE_SCHEMA = [
    { name: OBJECT_STORES.SPATIAL_LAYERS, keyPath: 'id', autoIncrement: true }
];