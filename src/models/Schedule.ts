import PeriodController from '../controllers/PeriodController';
import Period from './entities/Period';
import { WeekAlgoContext } from '../algos/WeekAlgo';
import Entity from './Entity';
import Subject from './entities/Subject';
import Grade from './Grade';
import EntityWithAvailability from './EntityWithAvailability';
import FitnessManager from '../lib/FitnessManager';
import Teacher from './entities/Teacher';
import Classroom from './entities/Classroom';
import { createContext } from '../utils/context';

export default class Schedule {
    readonly periods: PeriodController;
    protected periodFitness: Record<string, number>;
    protected context: WeekAlgoContext;

    constructor(context: WeekAlgoContext) {
        this.context = context;
        this.periods = new PeriodController();
    }

    getPeriod(index: number) {
        return this.periods.get(index);
    }

    entityCanSatisfyPeriod(entity: Entity, period: Period) {
        if(entity instanceof Subject) {
            // Check if the desired number of periods for this subject has been reached
            const context = this.context.student.getLink(Grade).config;
            const satisfiedPeriods = this.periods.all().filter(p => p.isLinkedTo(entity));
            if(entity.getProperty('periods', context)! < satisfiedPeriods.length) {
                return true;
            }
        } else if(entity instanceof EntityWithAvailability) {
            // Check if the entity is available
            return entity.isAvailable(period);
        }

        return false;
    }

    getFitness(period: Period) {
        return this.periodFitness[period.id] ?? 0.5;
    }

    seedSubject(subject: Subject) {
        const context = createContext(this.context.student);
        const periodCount = subject.getProperty('periods', context) ?? 0;
        const consecutivePeriodCount = subject.config.consecutivePeriods ?? 1;

        this.periods.allSortedByMedianDistance().every(period => {  
            const followingPeriods = period.listFor(consecutivePeriodCount - 1);
            if(period.isEmpty() && followingPeriods.every(p => p.isEmpty())) {
                for (let i = 0; i < consecutivePeriodCount; i++) {
                    // Find the consecutive period, offset by i.
                    // This also checks if the period is on the same day.
                    const consecutivePeriod = period.getConsecutiveOrFail(i);
                    // console.log(subject.id, i, consecutivePeriod?.id);

                    // If the next period does not exist or is on a different day
                    if(!consecutivePeriod) {
                        break;
                    }

                    this.recalculate(consecutivePeriod, subject);
                }
            }

            // Break if the required number of periods has been reached
            if(this.periods.all().filter(s => s.isLinkedTo(subject)).length >= periodCount) {
                return false;
            }
            
            return true;
        })
    }

    getUnsatisfiedSubjects() {
        const context = createContext(this.context.student);
        let result = true;

        return $subjects.allForStudent(this.context.student).filter(subject => {
            const requiredPeriodCount = subject.getProperty('periods', context) ?? 0;
            const calculatedPeriodCount = subject.getLinks(Period).length;
            
            return calculatedPeriodCount < requiredPeriodCount;
        })
    }

    recalculate(period: Period, subject?: Subject) {
        period.unlinkAll();

        if(!subject) {
            subject = this.bestSubjectForPeriod(period);
        }

        period.linkTo(subject);
    }

    bestSubjectForPeriod(period: Period) {
        const fitnessManager = new FitnessManager<Subject>();

        $subjects.allForStudent(this.context.student).forEach(subject => {
            const teacher = this.context.student.getLink(Grade).getCombiLink(Teacher, subject)!;
            const classroom = subject.getLink(Classroom);
            const grade = this.context.student.getLink(Grade);

            const context = createContext(teacher, this.context.student, period, classroom, subject);

            fitnessManager
                .child(subject)
                .fatal(() => this.entityCanSatisfyPeriod(subject, period))
                .fatal(() => this.entityCanSatisfyPeriod(teacher, period))
                .case(() => {
                    return classroom.getFitness(context);
                })
        })

        return fitnessManager.best();
    }
}