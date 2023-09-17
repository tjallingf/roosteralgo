import Entity from '../models/Entity';

export default class FitnessManagerChild<TEntity extends Entity> {
    readonly entity: TEntity;

    break: boolean = false;
    fitness: number = 0;

    constructor(entity: TEntity) {
        this.entity = entity;
    }

    require(callback: () => unknown) {
        this.break = !!callback();
        return this;
    }

    case(callback: () => number | null | false) {
        if(this.break) return this;

        const fitness = callback();
        if(typeof fitness === 'number') {
            this.fitness += fitness;
        }

        return this;
    }
}