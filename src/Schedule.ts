import _ from 'lodash';
import Meeting from './models/Meeting';
import Period from './models/entities/Period';
import PeriodIterator from './lib/PeriodIterator';

export default class Schedule {
    readonly id: string;
    protected meetings: Record<string, Meeting> = {};
    meetingsByPeriod: Record<number, Record<string, Meeting>> = {};

    constructor() {
        this.id = _.uniqueId('schedule_');

        // Create new meetings for each batch
        $batches.all().forEach(batch => {           
            batch.createMeetings(this).forEach(meeting => {
                this.storeMeeting(meeting);
            })
        })

        this.getMeetings().forEach(meeting => {
            meeting.__init();
        })

        $periods.all().forEach(period => {
            this.meetingsByPeriod[period.id] = {};
        })
    }

    seed(selectBestPeriodChance: number = 1) {
        const meetings: Meeting[] = [];
        $batches.all().forEach(bat => {
            meetings.push(...bat.getMeetings(this));
        })
            
        // Sort meetings by subject seedingPriority and number of students
        const sortedMeetings = _.orderBy(meetings, meeting => (
            50 * meeting.getSubject().seedingPriority +
            1  * meeting.getBatch().getStudents().length +
            10  * Math.random()
        ), 'desc');

        this.repair([]);

        // // Loop over every meeting
        // sortedMeetings.forEach(meeting => {
        //     const sortedPeriods = _.sortBy($periods.all(), p => meeting.getFitnessForPeriod(p));

        //     let i = 0;
        //     while(!meeting.getPeriod()) {
        //         const period = sortedPeriods[i++];
        //         const conflicts = this.getConflicts(meeting, period);
        //         if(conflicts.length === 0) {
        //             meeting.setPeriodWithCheck(period);
        //         }
        //     }

        //     // const batch = meeting.getBatch();
        //     // const periods = $periods.allSortedShuffled(5);
        //     // const bestCompatiblePeriod = periods.find(period => {
        //     //     let isCompatible: boolean = true;

        //     //     if(!meeting.getTeacher().availability.includes(period.getDay())) {
        //     //         return false;
        //     //     }
                
        //     //     if(meeting.getSubject().needsBlockMeetings()) {
        //     //         isCompatible = batch.getMeetings(this).every(m => this.isCompatible(m, period.next(m.getOrder())))
        //     //     } else {
        //     //         isCompatible = this.isCompatible(meeting, period);
        //     //     }

        //     //     return isCompatible;
        //     // }) ?? $periods.random();

        //     // const classroom = $classrooms.random();

        //     // // Check whether the subject needs block meetings
        //     // meeting.setPeriodWithCheck(bestCompatiblePeriod);
        //     // meeting.setClassroom(classroom);
        // })
    }

    repair(immovableMeetings: Meeting[]) {
        // let conflicts = new Set<Meeting>();
        // this.getMeetings().forEach(meeting => {   
        //     conflicts.add(meeting);    
        //     // if(!meeting.getPeriod()) {
        //     //     conflicts.add(meeting);
        //     //     return;
        //     // }

        //     // const conflicts2 = this.getConflicts(meeting, meeting.getPeriod());
        //     // if(conflicts2.length > 0) {
        //     //     conflicts.add(meeting);
        //     // }
        // });

        // console.log('Found', conflicts.size, 'conflicts');
        //console.log('conflicts:', new Array(...conflicts).map(m => [m.id, m.getPeriod()?.id]));

        const iterators: Record<string, PeriodIterator> = {};

        let j = 0;
        let conflicts = this.getAllConflicts();
        while(conflicts.length > 0) {
            conflicts.forEach((mtg, i) => {
                // Create a period iterator for this meeting if not created
                if(!iterators[mtg.id]) {
                    const sortedPeriods = mtg.getPeriodsSortedByFitness();
                    iterators[mtg.id] = new PeriodIterator(sortedPeriods);
                }

                // Get the period iterator for this meeting
                const periodIterator = iterators[mtg.id];

                // Get the next best period for this meeting and update the meeting
                const period = periodIterator.next();
                j++;
                mtg.setPeriod(period);
            })

            conflicts = this.getAllConflicts();
        }

        console.log('Moved meetings', j, 'times');
    }

    getAllConflicts() {
        return this.getMeetings().filter(mtg => {
            if(!mtg.getPeriod()) return true;
            return this.getConflicts(mtg, mtg.getPeriod()).length > 0;
        });
    }

    getMeetingsOnPeriod(period: Period) {
        return Object.values(this.meetingsByPeriod[period.id]);
    }

    getConflicts(meeting: Meeting, period: Period) {
        const meetings = this.getMeetingsOnPeriod(period);
        return meetings.filter(mtg => {
            if(mtg.skipConflictWith(meeting)) return false;
            return mtg.isCompatibleWith(meeting);
        });
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
        let totalFitness = 0;

        const meetings = this.getMeetings();
        meetings.forEach(meeting => {
            if(!meeting.getPeriod()) return;
            const fitness = meeting.getFitnessForPeriod(meeting.getPeriod());
            totalFitness += fitness.getFloat();

            if(fitness.getFloat() < 1) {
                // console.log(meeting.id, fitness.getScores())
            }
        })

        return totalFitness / meetings.length;
    }
}