import { EntityConfig } from '../Entity';
import Subject from './Subject';
import Config from '../../lib/Config';
import EntityWithAvailability from '../EntityWithAvailability';

export interface PeriodConfig extends EntityConfig {
    id: number
}

/**
 * Direct sibling: a period adjacent to another period, on the same day
 */
export default class Period extends EntityWithAvailability<PeriodConfig> {
    day() {
        const periodsPerDay =  Config.get('NUMBER_OF_PERIODS_PER_WEEK') / 5;
        return Math.floor(this.config.id / periodsPerDay);
    }
    
    offset(offset = 1): Period {
        return this.controller.get(this.config.id + offset);
    }

    offsetOrFail(offset = 1): Period {
        return this.controller.getOrFail(this.config.id + offset);
    }

    next(offset = 1) {
        return this.offset(offset);
    }

    previous(offset = 1) {
        return this.offset(-1 * offset);
    }
    
    getFreeAdjacentSiblings(periodSpan: number) {
        let freeAdjacentSiblings: Period[] = [];

        for (let i = 0; i < periodSpan; i++) {
            // Find the consecutive period, offset by i.
            // This also checks if the period is on the same day.
            const adjacentSibling = this.getAdjacentSibling(i);

            // Break if there are no more siblings
            if(!adjacentSibling) break;

            if(adjacentSibling.isFree()) {
                freeAdjacentSiblings.push(adjacentSibling)
            } else {
                // If an occupied period was found, clear the array
                freeAdjacentSiblings = [];
            }
        }

        return freeAdjacentSiblings;
    }

    getAdjacentSibling(offset = 1) {
        const sibling = this.controller.getOrFail(this.config.id + offset);

        // Sibling is null if it exceeds the number of periods per week.
        // Also check if the periods are on the same day.
        if(!sibling || sibling.day() !== this.day()) {
            return null;
        }

        return sibling;
    }

    isFreeUntil(untilPeriod: Period) {
        let result = true;
        const indexDiff = Math.abs(untilPeriod.config.id - this.config.id);

        for (let i = 0; i < indexDiff; i++) {
            // Get the period that matches the current 'i'.
            const period = i === 0 ? this : this.controller.getOrFail(i);
            
            // Period is null when the id is not in the valid range
            if(!period || !period.isFree()) {
                result = false;
                break;
            }
        }

        return result;
    }

    isFree() {
        return this.getLinks(Subject).length === 0;
    }
}