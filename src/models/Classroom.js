const Entity = require('./Entity');

module.exports = class Classroom extends Entity {
    constructor(config) {
        super(config.id, config);
    }
}