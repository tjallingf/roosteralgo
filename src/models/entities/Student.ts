import EntityWithAvailability from '../EntityWithAvailability';
import Batch, { BatchConfig } from '../Batch';
import Subject from './Subject';

export interface StudentConfig {
    id: number;
    year: BatchConfig['year'];
    level: BatchConfig['level'];
    name: string;
    grade: string;
    subjects: string[];
}

export default class Student extends EntityWithAvailability<StudentConfig> {
    getGradeId() {
        return `${this.config.year}_${this.config.level}`;
    }

    getBatch(subject: Subject) {
        return this.getLinks(Batch).find(b => b.config.subject.id === subject.id)!;
    }
}