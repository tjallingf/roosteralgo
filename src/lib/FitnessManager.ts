import FitnessManagerChild from './FitnessManagerChild';
import Entity from '../models/Entity';

export default class FitnessManager<TEntity extends Entity> {
    children: Record<string, FitnessManagerChild<TEntity>> = {};

    child(entity: TEntity) {
        if(this.children[entity.id]) {
            throw new Error(`FitnessManagerChild with id '${entity.id}' already exists.`)
        }

        this.children[entity.id] = new FitnessManagerChild<TEntity>(entity);
        return this.children[entity.id];
    }

    best(): TEntity {
        return Object.values(this.children).sort((a, b) => a.fitness > b.fitness ? 1 : -1)[0].entity;
    }
}