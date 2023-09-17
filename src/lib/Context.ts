import type Classroom from '../models/entities/Classroom';
import type Period from '../models/entities/Period';
import type Student from '../models/entities/Student';
import type Teacher from '../models/entities/Teacher';
import type Subject from '../models/entities/Subject';
import { forIn } from 'lodash';
import Entity from '../models/Entity';
import Batch from '../models/Batch';

export type ContextCondition = Record<string, string | number | (string | number)[]>;
export type ContextItem<TValue> = [ContextCondition, TValue];
export type ContextList<TValue> = ContextItem<TValue>[];

export interface ContextData {
    classroom: Classroom,
    period: Period,
    student: Student,
    subject: Subject,
    teacher: Teacher,
    batch: Batch
}

export interface SerializedContextData {
    classroom: string,
    period: string,
    student: string,
    subject: string,
    teacher: string,
    level: string,
    year: number,
}

export default class Context {
    get batch() { return this.data.batch; }
    get student() { return this.data.student; }
    get teacher() { return this.data.teacher; }
    get classroom() { return this.data.classroom; }
    get period() { return this.data.period; }
    get subject() { return this.data.subject; }

    data: ContextData = {} as ContextData;

    constructor(...entities: Entity[]) {
        entities.forEach(entity => {
            this.update(entity);
        })
    }

    update(entity: Entity) {
        if (!entity?.constructor?.name) return;
        const type = entity.constructor.name.toLowerCase();
        this.data[type] = entity;
    }

    match<TValue = number>(list: ContextList<TValue>): TValue | null {
        const data = this.serialize();

        // If entries is not an array, return it as-is
        if (!Array.isArray(list)) {
            return list;
        }

        let foundResult: TValue | null = null;
        list.every(([condition, result]) => {
            let doBreak = false;
            forIn(condition, (acceptValues, key) => {
                if (!data[key]) {
                    throw new Error(`Invalid context key: '${key}'.`);
                }

                const actualValue = typeof data[key].id === 'undefined' ? data[key] : data[key].id;
                const matches = Array.isArray(acceptValues)
                    ? acceptValues.includes(actualValue)
                    : acceptValues === '*' || actualValue == acceptValues;

                if (matches) {
                    // Update the result
                    foundResult = result;

                    // Break the .every() loop
                    doBreak = true;

                    // Break the forIn() loop
                    return false;
                }

                return true;
            })

            return !doBreak;
        })

        return foundResult;
    }

    serialize(): SerializedContextData {
        return {
            year: this.data.student?.config?.year,
            level: this.data.student?.config.level,
            student: this.data.student?.id,
            teacher: this.data.teacher?.id,
            subject: this.data.subject?.id,
            classroom: this.data.classroom?.id,
            period: this.data.period?.id
        }
    }
}