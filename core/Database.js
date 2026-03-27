//------------------------------------------------------------------------------------
/**
 * Promise-based wrapper for the IndexedDB Database.
 */
//------------------------------------------------------------------------------------
class Database {
    /**
     * Initialize the IndexedDB wrapper
     * @param {string} dbName The name of the database
     * @param {number} version The version of the database
     */
    constructor(dbName, version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    /**
     * Opens the database connection and handles schema upgrades.
     * @param {Array} stores Array of object store setups: [{ name: 'users', keyPath: 'id', autoIncrement: true }]
     * @returns {Promise<IDBDatabase>}
     */
    open(stores = []) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = () => {
                const db = request.result;

                // Create object stores if they don't exist
                stores.forEach(({ name, keyPath, autoIncrement = false }) => {
                    if (!db.objectStoreNames.contains(name)) {
                        const options = { autoIncrement };
                        if (keyPath) options.keyPath = keyPath;
                        
                        db.createObjectStore(name, options);
                    }
                });
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onerror = () => {
                reject(new Error(`IndexedDB Open Error: ${request.error?.message}`));
            };
        });
    }

    /**
     * Helper to initiate a transaction and retrieve an object store.
     * @param {string} storeName The name of the object store to access.
     * @param {IDBTransactionMode} [mode='readonly'] The transaction mode ('readonly' or 'readwrite').
     * @returns {IDBObjectStore} The requested object store.
     * @throws {Error} If the database has not been opened yet.
     */
    #getStore(storeName, mode = 'readonly') {
        if (!this.db) {
            throw new Error("Database is not open. Call open() first.");
        }
        return this.db.transaction(storeName, mode).objectStore(storeName);
    }

    /**
     * Helper to wrap an IDBRequest in a standard Promise.
     * @param {IDBRequest} request The IndexedDB request to wrap.
     * @returns {Promise<any>} A promise resolving to the request's result.
     */
    #promisify(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Retrieves a single item from the specified store by its key.
     * @param {string} storeName The name of the object store.
     * @param {string|number} key The unique key of the item to retrieve.
     * @returns {Promise<any>} A promise resolving to the retrieved item, or undefined if not found.
     */
    get(storeName, key) {
        return this.#promisify(this.#getStore(storeName).get(key));
    }

    /**
     * Retrieves all items from the specified store.
     * @param {string} storeName The name of the object store.
     * @returns {Promise<Array>} A promise resolving to an array of all items in the store.
     */
    getAll(storeName) {
        return this.#promisify(this.#getStore(storeName).getAll());
    }

    /**
     * Adds or updates an item in the specified store.
     * @param {string} storeName The name of the object store.
     * @param {Object} item The data object to insert or update.
     * @returns {Promise<string|number>} A promise resolving to the key of the stored item.
     */
    put(storeName, item) {
        return this.#promisify(this.#getStore(storeName, 'readwrite').put(item));
    }

    /**
     * Deletes a single item from the specified store by its key.
     * @param {string} storeName The name of the object store.
     * @param {string|number} key The unique key of the item to delete.
     * @returns {Promise<void>} A promise that resolves when the item is deleted.
     */
    delete(storeName, key) {
        return this.#promisify(this.#getStore(storeName, 'readwrite').delete(key));
    }
}

export const DATABASE = new Database('CapstoneDB', 3);