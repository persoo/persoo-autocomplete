export default class Cache {
    store = {};

    get(key) {
        return this.store[key];
    }

    set(key, value) {
        this.store[key] = value;
        return value;
    }

    reset() {
        this.store = {};
    }
}