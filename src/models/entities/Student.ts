import EntityWithAvailability from '../EntityWithAvailability';
import { GradeConfig } from '../Grade';

export interface StudentConfig {
    id: number;
    year: GradeConfig['year'];
    level: GradeConfig['level'];
    name: string;
}

export default class Student extends EntityWithAvailability<StudentConfig> {

}