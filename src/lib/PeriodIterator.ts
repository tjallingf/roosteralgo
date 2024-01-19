import _ from 'lodash';
import Period from '../models/entities/Period';

export default class PeriodIterator {
    periods: Period[];
    originalPeriods: Period[];

    constructor(periods: Period[]) {
        this.originalPeriods = periods;
        this.reset();
    }

    reset() {
        this.periods = [...this.originalPeriods];
    }

    remove(period: Period) {
        this.periods = this.periods.filter(prd => prd.id !== period.id);
    }

    next(): Period {       
        if(this.periods.length === 0) {
            this.reset();
        }

        return this.periods.shift()!;
    }

    randomBetween(min: number, max: number) {
        const period = _.sample(this.periods.slice(min, max));
        if(!period) return null;
        
        this.remove(period);
        return period;
    }
}