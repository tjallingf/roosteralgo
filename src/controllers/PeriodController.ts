import ControllerClass from '../lib/ControllerClass';
import Period from '../models/entities/Period';

export default class PeriodController extends ControllerClass<Period>() {
    readonly meta: {
        periodCountPerDay: number;
        medianPeriodDayIndex: number;
    }

    constructor() {
        super();
        
        const periodCountPerDay = Math.round(this.all().length / 5);

        // The median period sits around one-third of the day
        const medianPeriodDayIndex = Math.round(periodCountPerDay / 3);
        this.meta = { periodCountPerDay, medianPeriodDayIndex };
    }

    // Get the distance between the median period and the given period.
    getDistanceFromMedian(period: Period) {
        const dayIndex = Math.round(period.config.id % this.meta.periodCountPerDay);

        // Prefer periods before the median over periods after the median
        const modifier = dayIndex <= this.meta.medianPeriodDayIndex ? 0 : this.meta.medianPeriodDayIndex;

        return Math.abs(dayIndex - this.meta.medianPeriodDayIndex) + modifier;
    }

    load() {       
        for (let i = 0; i < $config.get('NUMBER_OF_PERIODS_PER_WEEK'); i++) {
            this._storeItem(new Period({ id: i }, this));
        }
    }

    getByIndex(index = 0) {
        const safeIndex = index % $config.get('NUMBER_OF_PERIODS_PER_WEEK');
        return this.getBy(p => p.config.id === safeIndex);
    }

    // TODO: memoize
    allSortedByMedianDistance() {
        // Sort ascending
        return this.all().sort((a, b) => this.getDistanceFromMedian(a) < this.getDistanceFromMedian(b) ? -1 : 1);
    }
}