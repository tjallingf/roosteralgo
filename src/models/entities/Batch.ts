import Entity, { EntityConfig } from '../Entity';
import Subject from './Subject';
import Grade from '../Grade';
import BatchController from '../../controllers/BatchController';
import Context from '../../lib/Context';
import Teacher from './Teacher';
import Meeting from '../Meeting';
import Student from './Student';
import Schedule from '../../Schedule';
import _ from 'lodash';
import Period from './Period';
import FitnessManager from '../../lib/FitnessManager';

export interface BatchConfig extends EntityConfig {
    id: string;
    subject: Subject;
    grade: Grade;
    /** To allow multiple batches for the same grade and subject */
    number: number;
}

export default class Batch extends Entity<BatchConfig, BatchController> {
    protected meetings: Record<string, Record<string, Meeting>> = {};
    protected meetingCount: number;
    protected bestCompatible: Batch;

    constructor(config: Omit<BatchConfig, 'id'>, controller: any) {
        const letter = String.fromCharCode(65 + config.number);
        const id = `${config.grade.id}_${config.subject.id}_${letter}`;
        super({ id, ...config }, controller);

        this.linkTo(this.config.subject).linkTo(this.config.grade);

        // Calculate number of meetings
        const context = Context.fromEntities(this);
        this.meetingCount = this.getSubject().getProperty('periods', context) ?? 0;

        // Memoize expensive functions
        this.getStudentsInCommon = _.memoize(this.getStudentsInCommon);
        this.isCompatibleWith = _.memoize(this.isCompatibleWith);
    }

    __init() {
        $batches.all().forEach(that => {
            if(this === that || this.isLinkedTo(that)) return;
            if(this.getGrade() !== that.getGrade()) return;
            
            if(this.getStudentsInCommon(that).length === 0) {
                this.linkTo(that);
                return;
            }
        })
    }

    getFitnessForPeriod(p: Period, schedule: Schedule) {
        const fitness = new FitnessManager();
        
        fitness.addSoftConstraint('DISTANCE_FITNESS', 1);

        if(this.getSubject().needsBlockMeetings()) {
            fitness.set('DISTANCE_FITNESS', 1/p.getDistanceFromMedian());
        } else {
            fitness.set('DISTANCE_FITNESS', p.getDistanceFromMedian());
        }

        return fitness;
    }

    getStudentsInCommon(that: Batch) {
        return this.getStudents().filter(stu => stu.isLinkedTo(that));
    }

    listCompatibles() {
        if(!this.bestCompatible) return [];
        return [ this.bestCompatible ];
    }

    setBestCompatible(that: Batch) {
        if(!this.isCompatibleWith(that)) {
            console.log('NOT COMPAIBLE!');
        }
        this.bestCompatible = that;
    }

    isCompatibleWith(that: Batch) {
        if(this.getTeacher() === that.getTeacher()) return false;
        if(this.getGrade() !== that.getGrade()) return true;
        return this.isLinkedTo(that);
    }

    createMeetings(schedule: Schedule) {
        for (let i = 0; i < this.meetingCount; i++) {
            const meeting = new Meeting(this, i, schedule);
            this.storeMeeting(schedule, meeting);
        }

        return this.getMeetings(schedule);
    }

    storeMeeting(schedule: Schedule, meeting: Meeting) {
        this.meetings[schedule.id] ??= {};
        this.meetings[schedule.id][meeting.id] = meeting;
        return this;
    }

    getGrade() {
        return this.getLink(Grade);
    }

    getTeacher() {
        return this.getLink(Teacher);
    }

    getSubject() {
        return this.getLink(Subject);
    }

    getStudents() {
        return this.getLinks(Student);
    }

    getMeetingCount() {
        return this.meetingCount;
    }

    getMeetingByOrder(schedule: Schedule, mtgOrder: number) {
        return this.getMeetings(schedule).find(mtg => mtg.getOrder() === mtgOrder)!;
    }

    getMeetings(schedule: Schedule) {
        return Object.values(this.meetings[schedule.id]);
    }
}