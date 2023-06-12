const Entity = require('./Entity');

module.exports = class EssentialEntity extends Entity {
    constructor(config) {
        super(config.id, config);
    }

    /**
     * 
     * @param {number} hour 
     */
    isAvailable(hour) {

    }

    setAvailability(hour, isAvailable) {
        
    }
}