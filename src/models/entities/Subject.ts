import Entity from '../Entity';
import Student from './Student';
import Teacher from './Teacher';
import { ContextList } from '../../lib/Context';
import SubjectController from '../../controllers/SubjectController';

export type SubjectTag = 'CORE_SUBJECT' | 'BLOCK_MEETINGS';

export interface SubjectConfig {
    id: string;
    teachers: number[];
    periods: ContextList<number>;
    name: string;
    tags?: SubjectTag[]
}

export default class Subject extends Entity<SubjectConfig, SubjectController> {
    seedingPriority: number;
    numericId: number;
    bitmask: number;

    __init() {
        if(this.config.teachers?.length) {
            this.config.teachers.forEach(id => {
                const teacher = $teachers.get(id);
                this.linkTo(teacher);
            })
        }

        this.numericId = this.calcNumericId();
        this.bitmask = this.calcBitmask();
        this.seedingPriority = this.calcSeedingPriority();
        // $logger.debug(`Created subject '${this.id}' (seeding=${this.seedingPriority}).`);
    }

    calcNumericId() {
        return Object.values(this.controller._items).length;
    }

    calcBitmask() {
        return Math.pow(2, this.numericId);
    }

    hasStudent(student: Student) {
        return this.isLinkedTo(student);
    }

    getStudents() {
        return this.getLinks(Student);
    }

    getTeachers() {
        return this.getLinks(Teacher);
    }

    hasTag(tag: SubjectTag) {
        return !!(this.config.tags?.includes(tag));
    }

    needsBlockMeetings() {
        return this.hasTag('BLOCK_MEETINGS');
    }

    isCoreSubject() {
        return this.hasTag('CORE_SUBJECT');
    }

    protected calcSeedingPriority() {
        let seedingPriority = 0;

        // Subject that requires all periods to be adjacent
        if(this.hasTag('BLOCK_MEETINGS')) {
            seedingPriority += 10;
        } 

        return seedingPriority;
    }
}