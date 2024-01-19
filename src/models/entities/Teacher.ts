import EntityWithAvailability from '../EntityWithAvailability';
import Context from '../../lib/Context';
import { ContextList } from '../../lib/Context';
import type TeacherController from '../../controllers/TeacherController';
import Entity from '../Entity';
import Period from './Period';
import _ from 'lodash';

export interface TeacherConfig {
    id: number;
    code: string;
    name: string;
    batches: ContextList<number>;
}

export default class Teacher extends EntityWithAvailability<TeacherConfig, TeacherController> {
    availability: number[];
    
    constructor(config: TeacherConfig, controller: TeacherController) {
        super(config, controller);

        this.availability = _.shuffle(_.range(0, 5)).slice(0, _.random(3,5));
        console.log(this.config.code, this.availability);
    }
    
    getFitness(context: Context) {
        return Math.random();
    }

}