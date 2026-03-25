/**
 * Wrapper for the IndexedDB Database.
 */
class Database {
    /**
     * Initialize the IndexedDB wrapper
     * @param {string} dbName - The name of the database
     * @param {number} version - The version of the database
     */
    constructor(dbName, version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    /**
     * Opens the database. 
     * @param {Array} stores - Array of object store setups: [{ name: 'users', keyPath: 'id', autoIncrement: true }]
     * @returns {Promise<IDBDatabase>}
     */
    open(stores = []) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                stores.forEach(store => {
                    if (!db.objectStoreNames.contains(store.name)) {
                        db.createObjectStore(store.name, {
                            keyPath: store.keyPath || 'id',
                            autoIncrement: store.autoIncrement || false
                        });
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(`IndexedDB Open Error: ${event.target.error}`);
            };
        });
    }

    /**
     * Helper to get a store and ensure the DB is open
     */
    #getStore(storeName, mode = 'readonly') {
        if (!this.db) throw new Error("Database is not open. Call open() first.");
        return this.db.transaction(storeName, mode).objectStore(storeName);
    }

    /**
     * Helper to wrap an IDBRequest in a Promise
     */
    #promisify(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    get(storeName, key) {
        return this.#promisify(this.#getStore(storeName).get(key));
    }

    getAll(storeName) {
        return this.#promisify(this.#getStore(storeName).getAll());
    }

    put(storeName, item) {
        return this.#promisify(this.#getStore(storeName, 'readwrite').put(item));
    }

    delete(storeName, key) {
        return this.#promisify(this.#getStore(storeName, 'readwrite').delete(key));
    }
}

export const DATABASE = new Database('CapstoneDB', 1);