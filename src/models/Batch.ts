import Entity from './Entity';
import Student from './entities/Student';
import Subject from './entities/Subject';

export interface BatchConfig {
    id: string;
    year: number;
    level: string;
}

export default class Batch extends Entity<BatchConfig> {
    #students = {};
    subject: Subject;

    constructor({ level, year, subject }) {
        const id = [level, year, subject.id].join('_');
        super({ id, level, year });

        this.subject = subject;
    }
}