import GeneticAlgo, { Population } from './GeneticAlgo';
import * as _ from 'lodash';
import Week from '../Week';

export default class MasterAlgo extends GeneticAlgo<Week> {
    fitness(entity: Week): number {
        let subjectSpreadFitness = 0;
        let requiredFitness = 0;

        if(requiredFitness === 0) {
            return 0;
        }

        return subjectSpreadFitness;
    }

    start() {
        $logger.info('Creating schedule...');
        return super.start();
    }

    seed() {
        const week = new Week();
        week.init();
        return week;
    }

    mutate(week: Week) {
        Object.values(week.schedules).forEach(schedule => {
            schedule.mutate();
        })

        return week;
    }

    selectOne(population: Population<Week>): Week {
        return population.reduce((max, i) => i.fitness > max.fitness ? i : max).entity;
    }
}