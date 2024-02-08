import { EntityConfig } from '../Entity';
import Subject from './Subject';
import Config from '../../lib/Config';
import EntityWithAvailability from '../EntityWithAvailability';
import type PeriodController from '../../controllers/PeriodController';

export interface PeriodConfig extends EntityConfig {
    id: number
}

const DAY_ABBREVIATIONS = [
    'mon', 'tue', 'wed', 'thu', 'fri'
];

/**
 * Direct sibling: a period adjacent to another period, on the same day
 */
export default class Period extends EntityWithAvailability<PeriodConfig, PeriodController> {
    protected day: number;
    protected distanceFromMedian: number;
    protected distanceFitness: number;
    protected relativeIndex: number;

    constructor(config: PeriodConfig, controller: any) {
        super(config, controller);
    }

    __init() {
        const periodsPerDay = $config.get('periodsPerWeek') / 5;
        const medianPeriodIndex = Math.round(periodsPerDay / 3);

        this.relativeIndex = this.id % periodsPerDay;

        // Prefer periods before the median over periods after the median
        this.distanceFromMedian = this.relativeIndex <= medianPeriodIndex ? (medianPeriodIndex - this.relativeIndex) : this.relativeIndex;

        this.day = Math.floor(this.id / periodsPerDay);
        this.distanceFitness = (periodsPerDay - this.distanceFromMedian) / periodsPerDay;
    }
    

    getDay() { return this.day; }
    getDistanceFromMedian() { return this.distanceFromMedian; }
    getDistanceFitness() { return this.distanceFitness; }
    getRelativeIndex() { return this.relativeIndex; }
    
    offset(offset = 1) {
        return this.controller.getSafe(this.id + offset);
    }

    next(offset = 1) {
        return this.offset(offset);
    }

    nextFittest() {
        const nextId = this.controller.allSorted().indexOf(this)+1;
        return this.controller.getSafe(nextId);
    }

    previous(offset = 1) {
        return this.offset(-1 * offset);
    }
    
    getAdjacentSiblings(periodSpan: number) {
        let adjacentSiblings: Period[] = [];

        for (let i = 0; i < periodSpan; i++) {
            // Find the consecutive period, offset by i.
            // This also checks if the period is on the same day.
            const adjacentSibling = this.getAdjacentSibling(i);

            // Break if there are no more siblings
            if(!adjacentSibling) break;

            adjacentSiblings.push(adjacentSibling);
        }

        return adjacentSiblings;
    }

    getAdjacentSibling(offset = 1) {
        const sibling = this.controller.getOrFail(this.id + offset);

        // Sibling is null if it exceeds the number of periods per week.
        // Also check if the periods are on the same day.
        if(!sibling || sibling.getDay() !== this.getDay()) {
            return null;
        }

        return sibling;
    }
}