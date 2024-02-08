import _ from 'lodash';
import Schedule from '../Schedule';
import FitnessManager from '../lib/FitnessManager';
import Entity, { EntityConfig } from './Entity';
import Batch from './entities/Batch';
import Classroom from './entities/Classroom';
import Period from './entities/Period';
import Subject from './entities/Subject';
import Teacher from './entities/Teacher';


export default class Meeting {
    protected batch: Batch;
    protected schedule: Schedule;
    protected period: Period | null = null;
    protected classroom: Classroom;
    protected order: number;
    protected meetingsToCheck: Meeting[];
    readonly id: string;

    constructor(batch: Batch, order: number, schedule: Schedule) {
        this.batch = batch;
        this.schedule = schedule;
        this.order = order;
        this.id = `${this.batch.id}_m${order}`;

        this.getPeriodsSortedByFitness = _.memoize(this.getPeriodsSortedByFitness);
        this.isCompatibleWith = _.memoize(this.isCompatibleWith);
        this.skipConflictWith = _.memoize(this.skipConflictWith);
    }

    __init() {
        const meetings = this.schedule.getMeetings();

        const thisIdx = meetings.indexOf(this);
        this.meetingsToCheck = meetings.filter((_, thatIdx) => thisIdx > thatIdx);
    }
    
    skipConflictWith(meeting: Meeting) {
        return !this.meetingsToCheck.includes(meeting);
    }

    // getConflicts() {
    //     const conflicts: Meeting[] = [];

    //     this.meetingsToCheck.forEach(that => {                          
    //         // Check if there are any students with conflicting periods.
    //         if(this.getPeriod() && that.getPeriod() && this.getPeriod() === that.getPeriod()) {
    //             if(!this.getBatch().isCompatibleWith(that.getBatch())) {
    //                 conflicts.push(that);
    //             }
    //         }
    //     })

    //     return conflicts;
    // }

    getFitness() {
        if(!this.getPeriod()) return 0;
        return this.getFitnessForPeriod(this.getPeriod());
    }

    getPeriodsSortedByFitness() {
        const allPeriods = $periods.all();
        const availablePeriods = allPeriods.filter(p => this.getTeacher().getFitnessForPeriod(p) > 0);
        return _.orderBy(availablePeriods, p => this.getFitnessForPeriod(p).getFloat(), 'desc');
    }

    getFitnessForPeriod(period: Period) {
        const fitness = new FitnessManager();
        // const studentCount = this.getBatch().getStudents().length;
        // let periodsOnDay = 0;

        // fitness.addHardConstraint('TEACHER_AVAILABLE', 1);
        // fitness.addHardConstraint('STUDENTS_AVAILABLE', 1);
        fitness.addHardConstraint('TEACHER_PERIOD_FITNESS', this.getTeacher().getFitnessForPeriod(period));
        fitness.addSoftConstraint('PERIOD_FITNESS', period.getDistanceFitness());

        // const previousPeriod = period.previous();
        // if(previousPeriod.getDay() === period.getDay()) {
        //     let totalStudentsOccupied = 0;

        //     const meetings = this.schedule.getMeetingsOnPeriod(previousPeriod);
        //     meetings.forEach(mtg => {
        //         const studentsInCommon = mtg.getBatch().getStudentsInCommon(this.getBatch())
        //         totalStudentsOccupied += studentsInCommon.length;
        //     })
        //     fitness.addSoftConstraint('STUDENTS_OCCUPIED_BEFORE', totalStudentsOccupied / this.getBatch().getStudents().length);
        // } else {
        //     fitness.addSoftConstraint('STUDENTS_OCCUPIED_BEFORE', 1);
        // }

        // let studentsOccupiedBeforeCount = 0;

        // this.meetingsToCheck.forEach(that => {
        //     const studentsInCommon = this.getBatch().getStudentsInCommon(that.getBatch());

        //     if(period.id === that.getPeriod().id) {
        //         if(this.getBatch().getTeacher() === that.getBatch().getTeacher()) {
        //             fitness.set('TEACHER_AVAILABLE', 0);
        //         }

        //         if(studentsInCommon.length > 0) {
        //             // console.log(this.getBatch().id, that.getBatch().id, studentsInCommon.length);
        //             fitness.set('STUDENTS_AVAILABLE', studentsInCommon.length / studentCount);
        //         }
        //     }
            
        //     if(period.id === that.getPeriod().previous().id) {
        //         studentsOccupiedBeforeCount += studentsInCommon.length;
        //     }

        //     // if(this.getTeacher().id === that.getTeacher().id && this.getPeriod().getDay() === that.getPeriod().getDay()) {
        //     //     periodsOnDay++;
        //     // }
        // })
        
        // if(period.getRelativeIndex() > 0) {
        //     fitness.set('STUDENTS_OCCUPIED_BEFORE', studentsOccupiedBeforeCount / studentCount);
        // }

        return fitness;
        // const fitness = new FitnessManager([ this ]);

        // const batch = this.getBatch();
        // const teacher = this.getTeacher();
        // const subject = this.getSubject();
        // const period = this.getPeriod();

        // if(this.schedule.getMeetings)

        // const allMeetings = this.schedule.getMeetings();
        // const batchMeetings = batch.getMeetings(this.schedule);
        // const teacherMeetings = allMeetings.filter(mtg => mtg.getTeacher() === teacher);

        // // Having multiple meetings on the same day is not preferred,
        // // unless the subject needs block meetings.
        // fitness.addBlock(() => {
        //     if(subject.needsBlockMeetings()) return;

        //     const meetingsOnSameDay = batchMeetings.filter(mtg => mtg.getPeriod().getDay() === period.getDay())
        //     if(meetingsOnSameDay.length > 1) {
        //         fitness.subtract(meetingsOnSameDay.length / batchMeetings.length);
        //     }
        // }, 10);

        // fitness.addBlock(() => {
        //     let teacherDays: number[] = [];

        //     teacherMeetings.forEach(mtg => {
        //         const day = mtg.getPeriod().getDay();

        //         if(!teacherDays.includes(day)) {
        //             teacherDays.push(day);
        //         }
        //     })

        //     fitness.subtract(teacherDays.length / 5);
        // }, 10);

        // fitness.addBlock(() => {
        //     fitness.add(period.getDistanceFitness());
        // }, 20)

        // return fitness.get();
    }

    copyTo(schedule: Schedule) {
        const meeting2 = schedule.getMeeting(this.id);
        
        meeting2.setPeriod(this.period);
        meeting2.setClassroom(this.classroom);

        return meeting2;
    }

    isCompatibleWith(that: Meeting) {
        return this === that || this.getBatch().isCompatibleWith(that.getBatch());
    }

    getOrder() { return this.order; }
    getBatch() { return this.batch; }
    getSubject() { return this.batch.getLink(Subject); }
    getTeacher() { return this.batch.getLink(Teacher); }

    getClassroom() { return this.classroom; }
    setClassroom(classroom: Classroom) {
        this.classroom = classroom;
        return this;
    }

    setPeriodWithCheck(period: Period) {
        if(this.getSubject().needsBlockMeetings()) {
            const meetings = this.getBatch().getMeetings(this.schedule);
            meetings.forEach(meeting => {
                meeting.setPeriod(period.next(meeting.getOrder()));
            })
        } else {
            this.setPeriod(period);
        }
    }

    getPeriod() { return this.period!; }
    setPeriod(period: Period | null) {
        if(this.period) {
            delete this.schedule.meetingsByPeriod[this.period.id][this.id];
        }

        if(period) {
            this.schedule.meetingsByPeriod[period.id][this.id] = this;
        }
        
        this.period = period;
        return this;
    }
}