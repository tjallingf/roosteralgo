export default class RegisterClass {
    #items = {};

    get(predicate) {
        return this.all().find(predicate)
    }

    getById(id) {
        return this.#items[id];
    }

    all() {
        return Object.values(this.#items);
    }
}