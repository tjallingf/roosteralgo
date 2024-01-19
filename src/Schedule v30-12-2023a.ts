import PeriodController from './controllers/PeriodController';
import _, { uniqueId } from 'lodash';
import Meeting from './models/Meeting';
import TeacherBatchLinkAlgo from './algo/TeacherBatchLinkAlgo';
import { group } from 'console';
import Batch from './models/entities/Batch';
import PeriodIterator from './lib/PeriodIterator';
import Period from './models/entities/Period';
import CompatibleBatchLinkAlgo from './algo/CompatibleBatchLinkAlgo';
import FitnessManager from './lib/FitnessManager old';

export default class Schedule {
    readonly id: string;
    protected meetings: Record<string, Meeting> = {};

    constructor() {
        this.id = _.uniqueId('schedule_');

        this.init();
    }

    protected init() {
        // Create new meetings for each batch
        $batches.all().forEach(batch => {           
            batch.createMeetings(this).forEach(meeting => {
                this.storeMeeting(meeting);
            })
        })
    }

    seed() {
        const coreSubject = $subjects.all().find(s => s.hasTag('CORE_SUBJECT'));
        const coreBatches = $batches.all().filter(b => b.getSubject() === coreSubject);

        coreBatches.forEach(coreBatch => {
            const grade = coreBatch.getGrade();

            const periods = $periods.allSortedShuffled(5);
            const periodIterator = new PeriodIterator(periods);
            
            // Sort meetings by subject seedingPriority and number of students
            const sortedBatches = _.sortBy(grade.getBatches(), bat => 1/(
                100 * bat.getSubject().seedingPriority +
                5   * bat.getStudents().length +
                5   * Math.random()
            ));

            sortedBatches.forEach(batch => {
                batch.getMeetings(this).forEach((meeting, i) => {
                    if(meeting.getPeriod()) return;

                    const period = periodIterator.nextBest();
                    const classroom = $classrooms.random();

                    const meetingsToSchedule = [ meeting ];

                    // Find more meetings to schedule at the same period
                    for (const compatibleBatch of batch.listCompatibles()) {
                        if(meetingsToSchedule.length >= 2) break;
                        meetingsToSchedule.push(compatibleBatch.getMeetingByOrder(this, i));
                    }

                    meetingsToSchedule.forEach(meeting => {
                        if(!meeting || meeting.getPeriod()) return;

                        meeting.setPeriod(period);
                        meeting.setClassroom(classroom);

                        // Check whether the subject needs block meetings
                        if(meeting.getSubject().needsBlockMeetings() && meeting.getOrder() === 0) {
                            const meetings = meeting.getBatch().getMeetings(this);
                            meetings.forEach((meeting2, i) => {
                                if(meeting2.getPeriod()) return;

                                const nextPeriod = period.next(i);
                                periodIterator.remove(nextPeriod);
                                
                                meeting2.setPeriod(nextPeriod);
                                meeting2.setClassroom(classroom);
                            })
                        }
                    })
                })
            })
        })
    }

    storeMeeting(meeting: Meeting) {
        this.meetings[meeting.id] = meeting;
        return this;
    }

    getMeetings() {
        return Object.values(this.meetings);
    }

    getMeeting(id: string) {
        return this.meetings[id];
    }

    getFitness() {
        // const numberOfConflicts = this.getConflicts();
        // if(numberOfConflicts > 0) return numberOfConflicts * -1000;

        return _.meanBy(this.getMeetings(), mtg => mtg.getFitness());
    }

    getConflicts() {
        let conflicts = 0;
        const meetings = this.getMeetings();
        
        meetings.forEach(a => {
            const filteredMeetings = meetings.filter((_, bIndex) => meetings.indexOf(a) > bIndex);
            filteredMeetings.forEach(b => {               
                // Check if there are any students with conflicting periods.
                if(a.getPeriod() && b.getPeriod() && a.getPeriod() === b.getPeriod()) {
                    // Only check for conflicting students if both batches are from the same grade.
                    if(!a.getBatch().isCompatibleWith(b.getBatch())) {
                        if(globalThis.log) {
                            console.log(a.getBatch().id, 'not ocmp with', b.getBatch().id, 'on period', a.getPeriod().id);
                        }
                        conflicts++;
                    }
                }
            })
        })

        return conflicts;
    }
}