import type Classroom from '../models/entities/Classroom';
import type Period from '../models/entities/Period';
import type Student from '../models/entities/Student';
import type Teacher from '../models/entities/Teacher';
import type Subject from '../models/entities/Subject';
import { forIn } from 'lodash';
import Entity from '../models/Entity';
import Grade from '../models/Grade';
import Batch from '../models/entities/Batch';

export type ContextCondition = Record<string, string | number | (string | number)[]>;
export type ContextItem<TValue> = [ContextCondition, TValue];
export type ContextList<TValue> = ContextItem<TValue>[];

export interface ContextData {
    classroom: Classroom,
    period: Period,
    subject: Subject,
    teacher: Teacher,
    grade: Grade,
    batch: Batch,
    student: Student
}

export interface SerializedContextData {
    classroom: string,
    period: number,
    subject: string,
    teacher: number,
    level: string,
    year: number
}

export default class Context {
    get student() { return this.data.student; }
    get batch() { return this.data.batch; }
    get grade() { return this.data.grade; }
    get teacher() { return this.data.teacher; }
    get classroom() { return this.data.classroom; }
    get period() { return this.data.period; }
    get subject() { return this.data.subject; }

    data: ContextData = {} as ContextData;

    constructor(...entities: Entity[]) {
        this.update(...entities);
        
        if(!this.data.grade && this.data.student) {
            this.data.grade = this.student.getLink(Grade);
        }

        if(!this.data.batch && this.data.student && this.data.subject) {
            this.data.batch = this.student.getBatch(this.data.subject);
        }
    }

    update(...entities: Entity[]) {
        entities.forEach(entity => {
            if (!entity?.constructor?.name) return;
            const type = entity.constructor.name.toLowerCase();
            this.data[type] = entity;
        })
    }

    merge(...entities: Entity[]) {
        const copy = new Context();
        copy.data = this.data;
        copy.update(...entities);
        return copy;
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
        const config = this.data.student?.config ?? this.data.grade?.config ?? this.data.batch?.config?.grade?.config;

        return {
            year: config?.year,
            level: config?.level,
            teacher: this.data.teacher?.id,
            subject: this.data.subject?.id,
            classroom: this.data.classroom?.id,
            period: this.data.period?.id
        }
    }
}