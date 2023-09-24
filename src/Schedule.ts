import Batch from './models/Batch';
import Teacher from './models/entities/Teacher';
import Context from './lib/Context';
import Week from './Week';
import PeriodController from './controllers/PeriodController';
import Student from './models/entities/Student';

export default class Schedule {
    readonly batch: Batch;
    readonly contexts: Record<string, Context> = {};
    readonly week: Week;
    readonly periods: PeriodController;

    constructor(week: Week, batch: Batch) {
        this.week = week;
        this.batch = batch;
        this.periods = new PeriodController(this.week);

        this.seed();
    }

    protected seed() {
        this.seedBatch(this.batch);
    }

    protected updateWhenFitter(context: Context) {
        if(this.newContextIsFitter(context)) {
            this.update(context);
        }
    }

    protected update(context: Context) {
        context.period.unlinkAll();
        context.period.linkTo(context.batch).linkTo(context.subject).linkTo(context.classroom).linkTo(context.batch.getLink(Teacher));
    } 

    protected newContextIsFitter(newContext: Context) {
        const currentContext = this.contexts[newContext.period.id];

        // If no context was found (meaning the given period is free)
        if(!currentContext) return true;

        return newContext.teacher.getFitness(newContext) > newContext.teacher.getFitness(currentContext);
    }

    protected attemptUpdate(context: Context) {
        if(!context.teacher.isAvailable(context.period)) {
            return false;
        }

        if(!context.batch.getLinks(Student).every(s => s.isAvailable(context.period))) {
            return false;
        }

        this.updateWhenFitter(context);
    }

    protected seedBatch(batch: Batch) {
        const subject = batch.config.subject;
        const teacher = batch.getLink(Teacher);
        const classroom = this.week.classrooms.all()[0];
        const baseContext = new Context(subject, batch, teacher, classroom);
        const periodCount = subject.getProperty('periods', baseContext) ?? 0;
        const periodSpan = subject.config.periodSpan ?? 1;

        this.periods.allSortedByMedianDistance().every(period => {
            // Break if the required number of periods has been reached
            if(this.periods.all().filter(s => s.isLinkedTo(subject)).length >= periodCount) {
                return false;
            }

            const context = baseContext.merge(period);

            if(periodSpan === 1) {
                if(period.isFree()) {
                    this.attemptUpdate(context);
                }
            } else {
                // If the subject spans more than one period
                const freeSiblings = period.getFreeAdjacentSiblings(periodSpan);
                if(freeSiblings.length >= periodSpan) {
                    freeSiblings.forEach(siblingPeriod => {
                        this.attemptUpdate(context.merge(siblingPeriod));
                    })
                }
            }
            
            return true;
        })

        // Throw an error if the required number of periods was not able to be scheduled
        if(this.periods.all().filter(s => s.isLinkedTo(subject)).length < periodCount) {
            throw new Error(`Could not schedule ${periodCount} periods for batch ${batch.id}.`);
        }
    }

    mutate() {
        // this.subjects.forEach(subject => {
        //     subject
        // })
    }
}