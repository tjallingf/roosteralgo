import _ from 'lodash';
import Schedule from '../Schedule';
import ControllerClass from '../lib/ControllerFactory';
import Period from '../models/entities/Period';
import Config from '../lib/Config';
import { mod } from '../lib/utils';

export default class PeriodController extends ControllerClass<Period>() {
    load() {      
        for (let i = 0; i < $config.get('periodsPerWeek'); i++) {
            this.store(new Period({ id: i }, this));
        }
    }

    allSorted() {
        return this.allSortedShuffled(0);
    }

    allSortedShuffled(distance = 0) {
        return _.sortBy(this.all(), p => p.getDistanceFromMedian() + Math.random()*distance/2);
    }

    getSafe(id = 0) {
        const safeId = mod(id, Config.get('periodsPerWeek'));
        return this.get(safeId);
    }
}