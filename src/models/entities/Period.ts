import Entity, { EntityConfig } from '../Entity';
import Subject from './Subject';
import Config from '../../lib/Config';
import PeriodController from '../../controllers/PeriodController';

export interface PeriodConfig extends EntityConfig {
    id: number
}

export default class Period extends Entity<PeriodConfig> {
    day() {
        return this.config.id % (Config.get('NUMBER_OF_PERIODS_PER_WEEK') / 5);
    }
    
    offset(offset = 1) {
        return this.controller.get(this.config.id + offset);
    }

    offsetOrFail(offset = 1) {
        return this.controller.getOrFail(this.config.id + offset);
    }

    next(offset = 1) {
        return this.offset(offset);
    }

    previous(offset = 1) {
        return this.offset(-1 * offset);
    }

    listFor(offset = 1) {
        const result: Period[] = [];

        for (let i = 0; i < offset; i++) {
            const period = this.offsetOrFail(i);
            if(period) {
                result.push(period);
            }
        }

        return result;
    }

    getConsecutiveOrFail(offset = 1) {
        const sibling = this.controller.getOrFail(this.config.id + offset);
        console.log('A', sibling?.id, sibling.day(), this.day());

        // Sibling is null if it exceeds the number of periods per week.
        // Also check if the periods are on the same day.
        if(!sibling || sibling.day() !== this.day()) {
            return null;
        }

        return sibling;
    }

    isEmptyUntil(untilPeriod: Period) {
        let result = true;
        const indexDiff = Math.abs(untilPeriod.config.id - this.config.id);

        for (let i = 0; i < indexDiff; i++) {
            // Get the period that matches the current 'i'.
            const period = i === 0 ? this : this.controller.getOrFail(i);
            
            // Period is null when the id is not in the valid range
            if(!period || !period.isEmpty()) {
                result = false;
                break;
            }
        }

        return result;
    }

    isEmpty() {
        return this.getLinks(Subject).length === 0;
    }
}