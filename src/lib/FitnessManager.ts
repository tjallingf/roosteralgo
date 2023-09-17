import FitnessManagerChild from './FitnessManagerChild';
import Entity from '../models/Entity';

export default class FitnessManager<TEntity extends Entity> {
    children: Record<string, FitnessManagerChild<TEntity>> = {};

    add(entity: TEntity) {
        if(this.children[entity.id]) {
            throw new Error(`FitnessManagerChild with id '${entity.id}' already exists.`)
        }

        this.children[entity.id] = new FitnessManagerChild<TEntity>(entity);
        return this.children[entity.id];
    }

    best(): FitnessManagerChild<TEntity> | undefined {
        return Object.values(this.children)
            .filter(child => !child.break)
            .sort((a, b) => a.fitness > b.fitness ? 1 : -1)[0];
    }
}