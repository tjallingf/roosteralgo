import EntityWithAvailability from '../EntityWithAvailability';
import Batch from '../Batch';
import Context from '../../lib/Context';
import { ContextList } from '../../lib/Context';

export interface TeacherConfig {
    id: number;
    code: string;
    name: string;
    batches: ContextList<number>;
}

export default class Teacher extends EntityWithAvailability<TeacherConfig> {
    getFitness(context: Context) {
        return Math.random();
    }
}