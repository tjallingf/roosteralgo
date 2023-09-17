import Entity, { EntityConfig } from './Entity';
import Subject from './entities/Subject';

export interface BatchConfig extends EntityConfig {
    year: number;
    level: 'HAVO' | 'VWO';
    subject: Subject
}

export default class Batch extends Entity<BatchConfig> {
    constructor(config: Omit<BatchConfig, 'id'>, controller: any) {
        const id = [config.year, config.level, config.subject.id].join('_');
        super({ id, ...config }, controller);
    }

    is(year: BatchConfig['year'], level: BatchConfig['level']) {
        return this.config.year === year && this.config.level === level;
    }
}