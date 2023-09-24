import EntityWithAvailability from '../EntityWithAvailability';
import Context from '../../lib/Context';
import { ContextList } from '../../lib/Context';
import type TeacherController from '../../controllers/TeacherController';

export interface TeacherConfig {
    id: number;
    code: string;
    name: string;
    batches: ContextList<number>;
}

export default class Teacher extends EntityWithAvailability<TeacherConfig, TeacherController> {
    getFitness(context: Context) {
        return Math.random();
    }
}