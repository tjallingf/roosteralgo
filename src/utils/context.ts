import { forIn } from 'lodash';
import type Student from '../models/entities/Student';
import type Teacher from '../models/entities/Teacher';
import type Classroom from '../models/entities/Classroom';
import type Period from '../models/entities/Period';
import type Subject from '../models/entities/Subject';

export type ContextCondition = Record<string, string | number | (string | number)[]>;
export type ContextItem<TValue> = [ContextCondition, TValue];
export type ContextList<TValue> = ContextItem<TValue>[];
export type Context = Partial<{
    level: string;
    year: number;
    teacher: number;
    classroom: string;
    subject: string;
    period: string;
}>

export const createContext = (...args: (Student | Teacher | Period | Subject | Classroom)[]) => {
    const context: Context = {};

    args.forEach(arg => {
        // TODO: replace with instanceof (circular dependency)
        if(arg.constructor.name === 'Student') {
            // TODO: replace with Grade (circular dependency)
            const grade = arg.getLink({ name: 'Grade' } as any);
            context.year = grade.config.year;
            context.level = grade.config.level;
        } else {
            context[arg.constructor.name.toLowerCase()] = arg.id;
        }
    })

    return context;
}

// Returns the result value, most often a fitness score
export const matchContext = <TValue = number>(items: ContextList<TValue>, match: Context): TValue | null => {
    // If entries is not an array, return it as-is
    if(!Array.isArray(items)) {
        return items;
    }
    
    let foundResult: TValue | null = null;
    items.every(([ condition, result ]) => {
        let doBreak = false;
        forIn(condition, (expectValue, key) => {
            if(!match[key]) {
                throw new Error(`Invalid context key: '${key}'.`);
            }

            if(expectValue === '*') {
                return true;
            }

            const actualValue = typeof match[key].id === 'undefined' ? match[key] : match[key].id;
            const matches = Array.isArray(expectValue) ? expectValue.includes(actualValue) : actualValue == expectValue;

            if(matches) {
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
