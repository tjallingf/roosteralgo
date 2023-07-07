import Entity, { EntityConfig } from './Entity';

export interface GradeConfig extends EntityConfig {
    year: number;
    level: 'HAVO' | 'VWO';
}

export default class Grade extends Entity<GradeConfig> {
    constructor(config: Omit<GradeConfig, 'id'>, controller: any) {
        const id = [config.year, config.level].join('_');
        super({ id, ...config }, controller);
    }

    is(year: GradeConfig['year'], level: GradeConfig['level']) {
        return this.config.year === year && this.config.level === level;
    }
}