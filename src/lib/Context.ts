import type Classroom from '../models/entities/Classroom';
import type Period from '../models/entities/Period';
import Student from '../models/entities/Student';
import Teacher from '../models/entities/Teacher';
import Subject from '../models/entities/Subject';
import { forIn } from 'lodash';
import Entity from '../models/Entity';
import Grade from '../models/Grade';
import Batch from '../models/entities/Batch';
import _ from 'lodash';

export type ContextCondition = Record<string, string | number | (string | number)[]>;
export type ContextItem<TValue> = [ContextCondition, TValue];
export type ContextList<TValue> = ContextItem<TValue>[];

export interface TTypes {
    student?: Student;
    batch?: Batch;
    grade?: Grade;
    teacher?: Teacher;
    subject?: Subject;
    period?: Period;
}

export default class Context {
    data: Record<string, any> = {};

    static fromEntities(...entities: Entity[]) {
        const types: TTypes = _.keyBy(entities, e => {
            if(!e) return null;
            return e.constructor.name.toLowerCase();
        });

        const data: Record<string, any> = {};
        if(types.batch) {
            types.grade ??= types.batch.getLink(Grade);
            types.student ??= types.batch.getLink(Student);
            types.subject ??= types.batch.getLink(Subject);
            types.teacher ??= types.batch.getLink(Teacher);
        }

        if(types.student) {
            types.grade ??= types.student.getLink(Grade);
        }

        if(types.teacher) data.teacher = types.teacher.id;
        if(types.period)  data.period  = types.period.id;
        if(types.subject) data.subject = types.subject.id;

        if(types.grade) {
            data.year = types.grade.config.year;
            data.level = types.grade.config.level;
        }
        
        return new Context(data);
    }

    constructor(data: Record<string, any>) {
        this.data = data;
        // this.update(...entities);
        
        // if(!this.data.grade && this.data.student) {
        //     this.data.grade = this.student.getLink(Grade);
        // }

        // if(!this.data.batch && this.data.student && this.data.subject) {
        //     this.data.batch = this.student.getBatch(this.data.subject);
        // }
    }


    match<TValue = number>(list: ContextList<TValue>): TValue | null {
        const data = this.data;

        // If entries is not an array, return it as-is
        if (!Array.isArray(list)) {
            return list;
        }

        let foundResult: TValue | null = null;
        list.every(([condition, result]) => {
            let doBreak = false;
            forIn(condition, (acceptValues, key) => {
                if (!(key in data)) {
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
}