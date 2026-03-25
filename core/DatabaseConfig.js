//------------------------------------------------------------------------------------
/**
 * Use these to prevent typos when querying the database.
 * @enum {string}
 */
//------------------------------------------------------------------------------------
export const STORE_NAMES = Object.freeze({
    IMPORTED_FILES: 'imported_files',
});

//------------------------------------------------------------------------------------
/**
 * Database schema configuration.
 * @type {Array<Object>}
 */
//------------------------------------------------------------------------------------
export const STORE_CONFIGS = [
    { name: STORE_NAMES.IMPORTED_FILES, keyPath: 'id', autoIncrement: true }
];