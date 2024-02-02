import PeriodController from '../controllers/PeriodController';
import Entity, { EntityConfig } from './Entity';
import Period from './entities/Period';

export default abstract class EntityWithAvailability<TConfig extends EntityConfig = any, TController extends any = any> extends Entity<TConfig, TController> {    
    isAvailable(period: Period) {
        return !this.isLinkedTo(period);
    }

    setAvailability(period: Period, isAvailable: boolean) {
        if(isAvailable) {
            this.linkTo(period);
        } else {
            this.unlinkFrom(period);
        }
    }
}