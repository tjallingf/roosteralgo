import Entity, { EntityConfig } from '../Entity';

export interface GradeConfig extends EntityConfig {
    year: number;
    level: 'HAVO' | 'VWO';
}

export default class Grade extends Entity<GradeConfig> {
    constructor(config: Omit<GradeConfig, 'id'>, controller: any) {
        const id = `${config.year}_${config.level}`;
        super({ id, ...config }, controller);
    }
}