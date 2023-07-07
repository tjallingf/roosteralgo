import Entity from '../models/Entity';

export default function ControllerClass<TEntity extends Entity>() {
    return class ControllerClass {
        _items: Record<string | number, TEntity | never> = {};

        constructor() {
            this.load();
        }

        load() {
            throw new Error('Method load() is not implemented.');
        }

        /**
         * 
         * @param {Entity} item 
         */
        _storeItem(item: TEntity) {
            const id = item.id+'';

            if(typeof this._items[id] !== 'undefined') {
                throw new Error(`Cannot override existing item with id '${id}'.`);
            }

            this._items[id] = item;
        }

        getBy(predicate: (entity: TEntity) => any) {
            const item = this.all().find(predicate);
            if(!item) throw new Error('Failed to find any entity with predicate.');
            return item;
        }

        getOrFail(id: string | number): TEntity | null {
            return this._items[id+''] ?? null;
        }

        get(id: string | number) {
            const item = this.getOrFail(id);

            if(typeof item === 'undefined' || item === null) {
                throw new Error(`Cannot find entity '${id}'.`);
            }
            
            return item;
        }

        all() {
            return Object.values(this._items);
        }
    }
}