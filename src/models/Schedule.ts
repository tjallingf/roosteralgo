// import PeriodController from '../controllers/PeriodController';
// import Period from './entities/Period';
// import Entity from './Entity';
// import Subject from './entities/Subject';
// import Batch from './Batch';
// import EntityWithAvailability from './EntityWithAvailability';
// import FitnessManager from '../lib/FitnessManager';
// import Teacher from './entities/Teacher';
// import Classroom from './entities/Classroom';
// import Student from './entities/Student';

// export interface ScheduleContext {
//     student: Student,
//     periods: PeriodController,
//     subjects: Subject[]
// }

// export default class Schedule {
//     readonly periods: PeriodController;
//     readonly context: ScheduleContext;
//     protected periodFitness: Record<string, number> = {};

//     constructor(context: ScheduleContext) {
//         this.context = context;
//         this.periods = new PeriodController();
//     }

//     getPeriod(index: number) {
//         return this.periods.get(index);
//     }

//     entityCanSatisfyPeriod(entity: Entity, period: Period) {
//         if(entity instanceof Subject) {
//             // Check if the desired number of periods for this subject has been reached
//             const context = this.context.student.getLink(Batch).config;
//             const occupiedPeriods = this.periods.all().filter(p => p.isLinkedTo(entity));
//             if(entity.getProperty('periods', context)! < occupiedPeriods.length) {
//                 return true;
//             }
//         } else if(entity instanceof EntityWithAvailability) {
//             // Check if the entity is available
//             return entity.isAvailable(period);
//         }

//         return false;
//     }

//     getFitness(period: Period) {
//         return this.periodFitness[period.id] ?? 0.5;
//     }

//     seedSubject(subject: Subject) {
//         const context = createContext(this.context.student);
//         const periodCount = subject.getProperty('periods', context) ?? 0;
//         const periodSpan = subject.config.periodSpan ?? 1;

//         this.periods.allSortedByMedianDistance().every(period => {  
//             if(periodSpan === 1) {
//                 if(period.isFree()) {
//                     this.updatePeriod(period, subject);
//                 }
//             } else {
//                 // If the subject spans more than one period
//                 const freeSiblings = period.getFreeAdjacentSiblings(periodSpan);
//                 if(freeSiblings.length >= periodSpan) {
//                     freeSiblings.forEach(sibling => {
//                         this.updatePeriod(sibling, subject);
//                     })
//                 }
//             }

//             // Break if the required number of periods has been reached
//             if(this.periods.all().filter(s => s.isLinkedTo(subject)).length >= periodCount) {
//                 return false;
//             }
            
//             return true;
//         })
//     }

//     getUnsatisfiedSubjects() {
//         const context = createContext(this.context.student);
//         let result = true;

//         return $subjects.allForStudent(this.context.student).filter(subject => {
//             const requiredPeriodCount = subject.getProperty('periods', context) ?? 0;
//             const calculatedPeriodCount = subject.getLinks(Period).length;
            
//             return calculatedPeriodCount < requiredPeriodCount;
//         })
//     }

//     updatePeriod(period: Period, subject: Subject) {
//         period.unlinkAll();
//         period.linkTo(subject);
//         period.linkTo(this.context.student);
//         const teacher = subject.getCombiLink(Teacher, this.context.student);
//         period.linkTo(subject.getCombiLink(Teacher, this.context.student)!);
//     }

//     recompute(period: Period) {
//         const fittest = this.fittestSubjectForPeriod(period);

//         if(!fittest) {
//             // If no fitting subject was found.
//             return;
//         }
//         const subject = fittest.entity;
//         $logger.debug(`Updating period ${period.id} to ${subject.id}`)

//         this.updatePeriod(period, subject);
//         this.periodFitness[period.id] = fittest.fitness;
//     }

//     classroomProposals(period: Period, teacher: Teacher, subject: Subject) {
//         const student = this.context.student;
//         const context = createContext(student, period, teacher, subject);

//         const adjacentPeriods = [ period.offsetOrFail(-1), period.offsetOrFail(-2), period.offsetOrFail(-3) ].filter(p => p && !p.isFree());

//         const proposals = new FitnessManager();
//         subject.getLinks(Classroom).forEach(classroom => {
//             proposals.add(classroom)
//                 .require(() => classroom.isAvailable(period))
//                 .case(() => {
//                     let score = 0;

//                     adjacentPeriods.forEach(period => {
//                         if(period.getLink(Classroom) === classroom) {
//                             score+= 0.25;
//                         }
//                     })

//                     return score;
//                 })
//         })
//     }

//     fittestSubjectForPeriod(period: Period) {
//         const fitnessManager = new FitnessManager<Subject>();

//         $subjects.allForStudent(this.context.student).forEach(subject => {
//             const teacher = this.context.student.getCombiLink(Teacher, subject)!;
//             const classrooms = this.classroomProposals(period, teacher, subject);
//             const classroom = classrooms[0];

//             const context = createContext(teacher, this.context.student, period, classroom, subject);
//             fitnessManager.add(subject)
//                 .require(() => this.entityCanSatisfyPeriod(subject, period))
//                 .require(() => this.entityCanSatisfyPeriod(teacher, period))
//                 .case(() => classroom.getFitness(context))
//         })

//         return fitnessManager.best();
//     }
// }