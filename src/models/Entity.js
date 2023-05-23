module.exports = class Entity {
    id;
    config;

    /**
     * 
     * @param {string} id 
     * @param {any} config 
     */
    constructor(id, config) {
        this.id = id;
        this.config = config;
    }
}