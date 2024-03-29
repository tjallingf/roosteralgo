import Context from '../lib/Context';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export interface EntityConfig {
    id: string | number
}

export type EntityConstructor = new (...args: any[]) => Entity;

export default abstract class Entity<TConfig extends EntityConfig = any, TController extends any = any> {       
    id: TConfig['id'];
    config: TConfig;
    linkedEntities: Record<string, Record<string | number, any>> = {};
    uuid: string;
    readonly controller: TController;

    constructor(config: TConfig, controller: TController) {
        this.id = config.id;
        this.config = config;
        this.controller = controller;
        this.uuid = uuidv4();
    }

    __afterStore() {
        this.__init();
    }
    
    protected __init(): void {}

    linkTo(entity: Entity, initial = true) {
        if(!entity) return this;

        const type = entity.constructor.name;
        if(!this.linkedEntities[type]) {
            this.linkedEntities[type] = {};
        }

        this.linkedEntities[type][entity.id] = entity;

        if(initial) {
            entity.linkTo(this, false);
        }

        return this;
    }

    unlinkAll() {
        _.forIn(this.linkedEntities, entities => {
            _.forOwn(entities, entity => {
                this.unlinkFrom(entity);
            })
        })

        return this;
    }

    unlinkFrom(entity: Entity, initial = true) {
        if(!entity) return this;
        
        const type = entity.constructor.name;
        if(this.linkedEntities[type] && this.linkedEntities[type][entity.id]) {
            delete this.linkedEntities[type][entity.id];
        }

        if(initial) {
            entity.unlinkFrom(this, false)
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
        return context.match(this.config[key] as any)
    }

    toJSON() {
        return { name: this.constructor.name, id: this.id };
    }
}