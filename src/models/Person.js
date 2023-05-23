const Entity = require('./Entity');

module.exports = class Person extends Entity {
    constructor(config) {
        super(config.id, config);
    }

    /**
     * 
     * @param {number} hour 
     */
    isAvailable(hour) {

    }
}