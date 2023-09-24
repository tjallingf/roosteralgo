import Entity, { EntityConfig } from './Entity';
import Subject from './entities/Subject';
import Grade from './entities/Grade';

export interface BatchConfig extends EntityConfig {
    subject: Subject;
    grade: Grade;
    /** To allow multiple batches for the same grade and subject */
    number: number;
}

export default class Batch extends Entity<BatchConfig> {
    constructor(config: Omit<BatchConfig, 'id'>, controller: any) {
        const letter = String.fromCharCode(65 + config.number);
        const id = `${config.grade.id}_${config.subject.id}_${letter}`;
        super({ id, ...config }, controller);

        this.linkTo(config.subject).linkTo(config.grade);
    }
}