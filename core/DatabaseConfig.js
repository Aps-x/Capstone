//------------------------------------------------------------------------------------
/**
 * Use these to prevent typos when querying the database.
 * @enum {string}
 */
//------------------------------------------------------------------------------------
export const OBJECT_STORES = Object.freeze({
    SPATIAL_LAYERS: 'spatial_layers',
});

//------------------------------------------------------------------------------------
/**
 * Database schema configuration.
 * @type {Array<Object>}
 */
//------------------------------------------------------------------------------------
export const DATABASE_SCHEMA = [
    { name: OBJECT_STORES.SPATIAL_LAYERS, keyPath: 'id', autoIncrement: true }
];