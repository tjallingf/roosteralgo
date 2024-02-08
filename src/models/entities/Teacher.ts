import EntityWithAvailability from '../EntityWithAvailability';
import Context from '../../lib/Context';
import { ContextList } from '../../lib/Context';
import type TeacherController from '../../controllers/TeacherController';
import Entity from '../Entity';
import Period from './Period';
import _ from 'lodash';
import Batch from './Batch';

export interface TeacherConfig {
    id: number;
    code: string;
    name: string;
    batches: ContextList<number>;
    requests: ContextList<number>;
}

export default class Teacher extends EntityWithAvailability<TeacherConfig, TeacherController> {
    availability: number[];
    
    constructor(config: TeacherConfig, controller: TeacherController) {
        super(config, controller);

        this.getFitnessForPeriod = _.memoize(this.getFitnessForPeriod);
    }

    getFitnessForBatch(batch: Batch) {
        return Math.random();
    }

    getFitnessForPeriod(period: Period) {
        const context = new Context({
            day: period.getDay()
        })

        const fitness = this.getProperty('requests', context) ?? 1;
        return fitness;
    }
}