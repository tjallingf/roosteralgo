import Entity, { EntityConfig } from './Entity';
import Batch from './entities/Batch';
import Student from './entities/Student';

export interface GradeConfig extends EntityConfig {
    id: string;
    year: number;
    level: 'HAVO' | 'VWO' | 'GYM' | 'ATH';
}

export default class Grade extends Entity<GradeConfig> {
    constructor(config: Omit<GradeConfig, 'id'>, controller: any) {
        const id = `${config.year}_${config.level}`;
        super({ id, ...config }, controller);
    }

    getBatches() {
        return this.getLinks(Batch);
    }

    getStudents() {
        return this.getLinks(Student);
    }
}