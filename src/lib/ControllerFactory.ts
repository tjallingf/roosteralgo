import _ from 'lodash';
import Entity from '../models/Entity';

export type Controller<TEntity extends Entity> = InstanceType<ReturnType<typeof ControllerFactory<TEntity>>>;

export default function ControllerFactory<TEntity extends Entity>() {
    return class ControllerClass {
        _items: Record<string | number, TEntity | never> = {};

        load() {
            throw new Error('Method load() is not implemented.');
        }

        store(entity: TEntity) {
            const id = entity.id+'';

            if(typeof this._items[id] !== 'undefined') {
                throw new Error(`Cannot override existing item with id '${id}'.`);
            }

            this._items[id] = entity;
            entity.__afterStore();
        }

        getBy(predicate: (entity: TEntity) => any) {
            const item = this.all().find(predicate);
            if(!item) throw new Error('Failed to find any entity with predicate.');
            return item;
        }

        getOrFail(id: string | number): TEntity | null {
            return this._items[id+''] ?? null;
        }

        random() {
            return _.sample(this._items)!;
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