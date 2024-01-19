import EntityWithAvailability from '../EntityWithAvailability';
import Batch, { BatchConfig } from './Batch';
import Subject from './Subject';
import Grade, { GradeConfig } from '../Grade';
import type StudentController from '../../controllers/StudentController';
import _ from 'lodash';

export interface StudentConfig {
    id: number;
    year: GradeConfig['year'];
    level: GradeConfig['level'];
    name: string;
    grade: string;
    subjects: string[];
}

export default class Student extends EntityWithAvailability<StudentConfig, StudentController> {
    __curriculumFlag: number;

    getGrade() {
        return this.getLink(Grade);
    }

    getCurriculumFlag() {
        return this.__curriculumFlag;
    }

    getBatch(subject: Subject) {
        return this.getLinks(Batch).find(b => b.config.subject.id === subject.id)!;
    }

    getSubjects() {
        return this.getLinks(Subject);
    }

    takesSubject(subject: Subject) {
        return this.isLinkedTo(subject);
    }
}