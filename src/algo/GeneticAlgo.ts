import { defaults } from 'lodash';
import _ from 'lodash';

export interface GeneticAlgoConfig {
    size: number;
    mutateChance: number;
    crossoverChance: number;
    iterations: number;
    eliteSize: number;
    tournamentSize: number;
}

export default abstract class GeneticAlgo<TEntity> {
    abstract fitness(entity: TEntity): number;
    abstract seed(): TEntity;
    abstract crossover(a: TEntity, b: TEntity, size: number): TEntity;
    abstract mutate(entity: TEntity, size: number): TEntity;

    readonly config: GeneticAlgoConfig = {
        size: 3,
        mutateChance: 0.5,
        crossoverChance: 0.7,
        eliteSize: 3,
        iterations: 5,
        tournamentSize: 3
    }
    protected population: TEntity[] = [];

    constructor(config: Partial<GeneticAlgoConfig>) {
        this.config = defaults(config, this.config);
    }

    async start() {
        // seed the population
        for (let i=0; i < this.config.size; i++)  {
            this.population.push(this.seed());
        }
			
        for (let i=0; i < this.config.iterations; i++) {
            this.population = this.evolve(i);
        }

        return this;
    }

    evolve(iteration: number) {   
        const sortedPopulation = this.sortPopulation(this.population);
        const size = (this.config.iterations - iteration) / this.config.iterations;
        console.log(`Iteration ${iteration} with fittest`, this.fitness(sortedPopulation[0]));
        let newPopulation = sortedPopulation;

        // Mutate
        newPopulation = newPopulation.map((entity, i) => {
            if(i < this.config.eliteSize) return entity;

            if(Math.random() <= this.config.mutateChance) {
                return this.mutate(entity, size);
            }

            return entity;
        })
        
        // Crossover
        newPopulation = newPopulation.map((entity, i) => {
            if(i < this.config.eliteSize) return entity;

            if(Math.random() <= this.config.crossoverChance) {
                const tournamentPopulation = this.selectTournamentPopulation(sortedPopulation, 2);
                return this.crossover(tournamentPopulation[0], tournamentPopulation[1], size)
            }

            return entity;
        })

        return newPopulation;
    }

    selectTournamentPopulation(sortedPopulation: TEntity[], size: number): TEntity[] {
        const tournamentPopulation = sortedPopulation.slice(0, Math.max(this.config.tournamentSize, size));
        return _.shuffle(tournamentPopulation).slice(0, size);
    }

    sortPopulation(population: TEntity[]) {
        return _.orderBy(population, e => this.fitness(e), 'desc');
    }

    result() {
        return this.sortPopulation(this.population)[0];
    }
}