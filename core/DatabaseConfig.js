//------------------------------------------------------------------------------------
/**
 * Use these to prevent typos when querying the database.
 * @enum {string}
 */
//------------------------------------------------------------------------------------
export const OBJECT_STORES = Object.freeze({
    IMPORTED_FILES: 'imported_files',
});

//------------------------------------------------------------------------------------
/**
 * Database schema configuration.
 * @type {Array<Object>}
 */
//------------------------------------------------------------------------------------
export const DATABASE_SCHEMA = [
    { name: OBJECT_STORES.IMPORTED_FILES, keyPath: 'id' }
];