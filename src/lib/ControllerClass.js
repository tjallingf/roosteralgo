const Entity = require('../models/Entity');

module.exports = function ControllerClass() {
    return class ControllerClass {
        static _items = {};

        /**
         * 
         * @param {Entity} item 
         */
        static _storeItem(item) {
            if(typeof this._items[item.id] !== 'undefined') {
                throw new Error(`Cannot override existing item with id '${item.id}'.`);
            }

            this._items[item.id] = item;
        }

        static get(predicate) {
            return this.all().find(predicate)
        }

        static getById(id) {
            if(typeof this._items[id] === 'undefined') {
                throw new Error(`Cannot find entity '${id}'.`);
            }
            
            return this._items[id];
        }

        static all() {
            return Object.values(this._items);
        }
    }
}