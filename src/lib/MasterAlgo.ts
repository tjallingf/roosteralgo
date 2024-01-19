import GeneticAlgo from '../algo/GeneticAlgo';
import * as _ from 'lodash';
import Schedule from '../Schedule';
import Period from '../models/entities/Period';
import Meeting from '../models/Meeting';
import PeriodIterator from './PeriodIterator';

export default class MasterAlgo extends GeneticAlgo<Schedule> {
    fitness(schedule: Schedule): number {
        // const conflicts = schedule.getConflicts();
        // if(conflicts > 0) return conflicts * -100;
        return schedule.getFitness();
    }

    start() {
        $logger.info('Creating schedule...');
        return super.start();
    }

    seed() {
        const schedule = new Schedule();
        schedule.seed(1);
        return schedule;
    }

    mutate(schedule: Schedule, size: number) {
        console.log({ size });
        const meetings = schedule.getMeetings();
        const count = Math.round(size * 4);
        const meetingsToSwap = _.shuffle(meetings).slice(0, count);

        meetingsToSwap.forEach((meetingA, i) => {
            const meetingB = meetings[i];

            const periodA = meetingA.getPeriod();
            const periodB = meetingB.getPeriod();

            meetingA.setPeriod(periodB);
            meetingB.setPeriod(periodA);
        })

        return this.repair(schedule, meetingsToSwap);
    }

    repair(schedule: Schedule, immovableMeetings: Meeting[]) {
        schedule.repair(immovableMeetings);
        return schedule;
    }

    crossover(a: Schedule, b: Schedule) {
        const schedule = new Schedule();

        $periods.all().forEach(period => {
            const meetings = (Math.random() > 0.5 ? a : b).meetingsByPeriod[period.id];
            Object.values(meetings).forEach(meeting => {
                meeting.copyTo(schedule);
            })
        })

        return schedule;
    }
}