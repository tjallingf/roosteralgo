import Entity, { EntityConfig } from './Entity';
import Period from './entities/Period';

export default abstract class EntityWithAvailability<TConfig extends EntityConfig, TController extends any> extends Entity<TConfig, TController> {
    isAvailable(period: Period) {
        return !this.isLinkedTo(period);
    }

    setAvailability(period: Period, isAvailable: boolean) {
        
    }
}