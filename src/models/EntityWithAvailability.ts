import Entity, { EntityConfig } from './Entity';
import Period from './entities/Period';

export default abstract class EntityWithAvailability<TConfig extends EntityConfig> extends Entity<TConfig> {
    isAvailable(period: Period) {
        return true;
    }

    setAvailability(period: Period, isAvailable: boolean) {
        
    }
}