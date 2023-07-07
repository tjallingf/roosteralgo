import { Context, matchContext } from '../utils/context';

export interface EntityConfig {
    id?: string | number
}

export type EntityConstructor = new (...args: any[]) => Entity;

export default abstract class Entity<TConfig extends EntityConfig = any, TController extends any = any> {       
    id: string;
    config: TConfig;
    linkedEntities: Record<string, Record<string | number, any>> = {};
    protected readonly controller: TController;

    constructor(config: TConfig, controller: TController) {
        this.id = config.id+'';
        this.config = config;
        this.controller = controller;

        this.init();
    }
    
    init(): void {}

    linkTo(entity: Entity, linkIndex = 0) {
        const type = entity.constructor.name;
        if(!this.linkedEntities[type]) {
            this.linkedEntities[type] = {};
        }

        this.linkedEntities[type][entity.id] = entity;

        if(linkIndex < 1) {
            entity.linkTo(this, linkIndex+1);
        }

        return this;
    }

    unlinkAll() {
        this.linkedEntities = {};
        return this;
    }

    unlinkFrom(entity: Entity, linkIndex = 0) {
        if(!entity) return;
        
        const type = entity.constructor.name;
        if(this.linkedEntities[type] && this.linkedEntities[type][entity.id]) {
            delete this.linkedEntities[type][entity.id];
        }

        if(linkIndex < 1) {
            entity.unlinkFrom(this, linkIndex+1)
        }

        return this;
    }

    isLinkedTo(entity: Entity) {
        return !!(this.linkedEntities[entity.constructor.name]?.[entity.id]);
    }

    getLinks<TEC extends EntityConstructor>(type: TEC): InstanceType<TEC>[] {
        return Object.values(this.linkedEntities[type.name] ?? {});
    }
    
    getLink<TEC extends EntityConstructor>(type: TEC): InstanceType<TEC> {
        return this.getLinks(type)[0];
    }

    getCombiLink<TEC extends EntityConstructor>(type: TEC, entity: Entity): InstanceType<TEC> | null {
        // The first entity is `this`, the second entity is `entity`.
        // Get all links of the first entity with the the supplied type.
        const entitiesOne = this.linkedEntities[type.name];
        if(!entitiesOne) return null;

        // Get all links of the second entity with the the supplied type
        const entitiesTwo = entity.linkedEntities[type.name];
        if(!entitiesTwo) return null;

        // Find the entities that are both in type one and type two
        return Object.values(entitiesOne).find(e => !!entitiesTwo[e.id]);
    }
    
    getProperty(key: keyof TConfig, context: Context) {
        return matchContext(this.config[key] as any, context);
    }

    toJSON() {
        return { name: this.constructor.name, id: this.id };
    }
}