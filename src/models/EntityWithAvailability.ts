import Entity, { EntityConfig } from './Entity';
import Period from './entities/Period';

export default abstract class EntityWithAvailability<TConfig extends EntityConfig> extends Entity<TConfig> {
    isAvailable(period: Period) {
        return !this.isLinkedTo(period);
    }

    setAvailability(period: Period, isAvailable: boolean) {
        
    }
}