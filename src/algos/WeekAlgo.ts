import Batch from '../models/Batch';
import Student from '../models/entities/Student';
import GeneticAlgo, { Population } from './GeneticAlgo';
import { shuffle } from 'lodash';
import Grade from '../models/Grade';
import Period from '../models/entities/Period';
import Schedule from '../models/Schedule';
import Subject from '../models/entities/Subject';
import { arrayAverage } from '../utils/array';
import { createContext } from '../utils/context';

export interface WeekAlgoContext {
    student: Student
}

export type WeekAlgoEntity = Schedule;

export default class WeekAlgo extends GeneticAlgo<WeekAlgoEntity, WeekAlgoContext> {
    fitness(entity: WeekAlgoEntity): number {
        let subjectSpreadFitness = 0;
        let requiredFitness = 0;

        if(requiredFitness === 0) {
            return 0;
        }

        return subjectSpreadFitness;
    }

    start() {
        $logger.info('Creating schedule for '+this.context.student.config.name);
        return super.start();
    }

    seed() {
        const schedule = new Schedule(this.context);
        const context = createContext(this.context.student);

        const subjects = $subjects.allForStudent(this.context.student);

        // Sort subjects by seeding priority (descending)
        const sortedSubjects = subjects.sort((a, b) => a.seedingPriority < b.seedingPriority ? 1 : -1);

        sortedSubjects.forEach(subject => {
            schedule.seedSubject(subject);
        })

        return schedule;
    }

    mutate(entity: Schedule) {
        // Calculate the average fitness over all periods of this schedule
        const averageFitness = arrayAverage(entity.periods.all().map(period => entity.getFitness(period)));

        entity.periods.all().forEach(period => {
            // Skip the period if it is above average fitness
            if(entity.getFitness(period) >= averageFitness) {
                return true;
            }

            // Recalculate the period
            entity.recalculate(period);
        })

        return entity;
    }

    selectOne(population: Population<WeekAlgoEntity>): WeekAlgoEntity {
        return population.reduce((max, i) => i.fitness > max.fitness ? i : max).entity;
    }
}