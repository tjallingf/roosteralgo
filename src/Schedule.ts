import PeriodController from './controllers/PeriodController';
import Classroom from './models/entities/Classroom';
import Period from './models/entities/Period';
import Student from './models/entities/Student';
import Subject from './models/entities/Subject';
import Teacher from './models/entities/Teacher';
import Context from './lib/Context';
import Batch from './models/Batch';

export default class Schedule {
    readonly student: Student;
    readonly subjects: Subject[];
    readonly periods: PeriodController;
    readonly contexts: Record<string, Context> = {};

    constructor(student: Student) {
        this.periods = new PeriodController();
        this.student = student;
        this.subjects = $subjects.allForStudent(this.student);

        this.seed();
    }

    protected seed() {
        this.subjects.forEach(subject => {
            this.seedSubject(subject);
        })
    }

    protected updateWhenFitter(context: Context) {
        if(this.newContextIsFitter(context)) {
            context.period.unlinkAll();
            context.period.linkTo(context.batch).linkTo(context.subject).linkTo(context.classroom);
            console.log(context.batch.getLink(Teacher));
        }
    }

    protected newContextIsFitter(newContext: Context) {
        const currentContext = this.contexts[newContext.period.id];

        // If no context was found (meaning the given period is free)
        if(!currentContext) return true;

        // If the teacher is available at the given period
        if(newContext.teacher.isAvailable(newContext.period)) return true;

        return newContext.teacher.getFitness(newContext) > newContext.teacher.getFitness(currentContext);
    }

    protected seedSubject(subject: Subject) {
        const batch = this.student.getBatch(subject);
        if(!batch) {
            console.log(this.student.id, subject.id);
        }
        const teacher = batch.getLink(Teacher);
        const classroom = $classrooms.all()[0];
        const context = new Context(subject, batch, teacher, classroom);
        const periodCount = subject.getProperty('periods', context) ?? 0;
        const periodSpan = subject.config.periodSpan ?? 1;

        this.periods.allSortedByMedianDistance().every(period => {
            context.update(period);

            if(periodSpan === 1) {
                if(period.isFree()) {
                    this.updateWhenFitter(context)
                }
            } else {
                // If the subject spans more than one period
                const freeSiblings = period.getFreeAdjacentSiblings(periodSpan);
                if(freeSiblings.length >= periodSpan) {
                    freeSiblings.forEach(siblingPeriod => {
                        context.update(siblingPeriod);
                        this.updateWhenFitter(context);
                    })
                }
            }

            // Break if the required number of periods has been reached
            if(this.periods.all().filter(s => s.isLinkedTo(subject)).length >= periodCount) {
                return false;
            }
            
            return true;
        })
    }

    mutate() {
        this.subjects.forEach(subject => {
            subject
        })
    }
}