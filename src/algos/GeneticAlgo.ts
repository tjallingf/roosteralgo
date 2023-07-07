import { cloneDeep, defaults } from 'lodash';

export interface GeneticAlgoConfig {
    size: number;
    mutation: number;
    crossover: number;
    iterations: number;
    fittestAlwaysSurvives: boolean
}

export type Population<AlgoEntity> = {
    entity: AlgoEntity,
    fitness: number
}[]

export default abstract class GeneticAlgo<AlgoEntity extends {} = {}, AlgoContext extends {} = {}> {
    abstract fitness(entity: AlgoEntity): number;
    abstract seed(): AlgoEntity;
    abstract selectOne(population: Population<AlgoEntity>): AlgoEntity

    readonly config: GeneticAlgoConfig;
    readonly context: AlgoContext;
    #entities: AlgoEntity[] = [];

    #DEFAULT_CONFIG = {
        size: 1,
        mutation: 0.5,
        crossover: 0.2,
        fittestAlwaysSurvives: true,
        iterations: 10
    }

    constructor(config: Partial<GeneticAlgoConfig>, context: AlgoContext) {
        this.config = defaults(config, this.#DEFAULT_CONFIG);
        this.context = context;
    }

    async start() {
        // seed the population
        for (let i=0; i < this.config.size; i++)  {
            this.#entities.push(this.#clone(this.seed()));
        }
			
        for (let i = 0; i < this.config.iterations; i++) {
            const population = this.#entities
                .map(entity => ({ 
                    fitness: this.fitness(entity), 
                    entity: entity 
                }))
                .sort((a, b) => a.fitness >= b.fitness ? -1 : 1);
            
            // crossover and mutate
            const newPopulation: AlgoEntity[] = [];
            
            if (this.config.fittestAlwaysSurvives) // lets the best solution fall through
                newPopulation.push(population[0].entity);
            
            while (newPopulation.length < this.config.size) {
                if (
                    (this as any).crossover // if there is a crossover function
                    && Math.random() <= this.config.crossover // base crossover on specified probability
                    && newPopulation.length+1 < this.config.size // keeps us from going 1 over the max population size
                ) {
                    const parents = [this.selectOne(population), this.selectOne(population)];
                    const children: AlgoEntity[] = (this as any).crossover(this.#clone(parents[0]), this.#clone(parents[1])).map(this.#mutateOrNot)
                    newPopulation.push(children[0], children[1]);
                } else {
                    newPopulation.push(this.#mutateOrNot(this.selectOne(population)));
                }
            }
            
            this.#entities = newPopulation;
        }

        return this;
    }

    result() {
        return this.#entities[0];
    }

    #clone(entity: AlgoEntity) {
        return cloneDeep(entity);
    }

    #mutateOrNot(entity: AlgoEntity) {
        if(typeof (this as any).mutate !== 'function') return entity;
        return Math.random() <= this.config.mutation ? (this as any).mutate(this.#clone(entity)) : entity;
    }
}