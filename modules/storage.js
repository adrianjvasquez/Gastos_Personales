/**
 * Storage Module handles local data persistence via localStorage.
 * Simulates a local database approach.
 */
class Storage {
    static get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    }

    static set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error writing to storage:', error);
        }
    }

    static clear() {
        localStorage.clear();
    }
}
