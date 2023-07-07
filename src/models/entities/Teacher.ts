import { ContextList, matchContext } from '../../utils/context';
import EntityWithAvailability from '../EntityWithAvailability';
import Grade from '../Grade';

export interface TeacherConfig {
    id: number;
    grades: ContextList<number>
}

export default class Teacher extends EntityWithAvailability<TeacherConfig> {
    getFitnessForGrade(grade: Grade) {
        return matchContext(this.config.grades, grade.config) ?? 0.5;
    }
}