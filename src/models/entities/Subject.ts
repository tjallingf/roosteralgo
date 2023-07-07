import Entity from '../Entity';
import Student from './Student';
import Teacher from './Teacher';
import { ContextList } from '../../utils/context';

export interface SubjectConfig {
    id: string;
    teachers: number[];
    periods: ContextList<number>;
    consecutivePeriods?: number;
    tags?: ('CORE')[]
}

export default class Subject extends Entity<SubjectConfig> {
    #students = {};
    #teachers = {};
    seedingPriority: number;

    init() {
        if(this.config.teachers?.length) {
            this.config.teachers.forEach(id => {
                const teacher = $teachers.get(id);
                this.linkTo(teacher);
            })
        }

        this.seedingPriority = this.calcSeedingPriority();
        $logger.debug(`Created subject '${this.id}' (seeding=${this.seedingPriority}).`);
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

    calcSeedingPriority() {
        let seedingPriority = 0;

        // Subjects with consecutive periods
        if(this.config.consecutivePeriods && this.config.consecutivePeriods > 1) {
            seedingPriority += 10 * this.config.consecutivePeriods
        } 
        
        // Subjects with various tags
        if(this.config.tags && this.config.tags.length) {
            // Subjects that are a KERNVAK
            if(this.config.tags.includes('CORE')) {
                seedingPriority += 5;
            }
        }

        return seedingPriority;
    }
}