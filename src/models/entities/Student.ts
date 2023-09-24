import EntityWithAvailability from '../EntityWithAvailability';
import Batch, { BatchConfig } from '../Batch';
import Subject from './Subject';
import { GradeConfig } from './Grade';
import type StudentController from '../../controllers/StudentController';

export interface StudentConfig {
    id: number;
    year: GradeConfig['year'];
    level: GradeConfig['level'];
    name: string;
    grade: string;
    subjects: string[];
}

export default class Student extends EntityWithAvailability<StudentConfig, StudentController> {
    getGradeId() {
        return `${this.config.year}_${this.config.level}`;
    }

    getBatch(subject: Subject) {
        return this.getLinks(Batch).find(b => b.config.subject.id === subject.id)!;
    }
}