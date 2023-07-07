import Input from './lib/Input';
import Config from './lib/Config';
import Logger from './lib/Logger';
import ClassroomController from './controllers/ClassroomController';
import SubjectController from './controllers/SubjectController';
import StudentController from './controllers/StudentController';
import TeacherController from './controllers/TeacherController';
import PeriodController from './controllers/PeriodController';
import WeekAlgo from './algos/WeekAlgo';
import BatchController from './controllers/BatchController';
import Subject from './models/entities/Subject';
import Teacher from './models/entities/Teacher';
import Grade from './models/Grade';
import MaximumCardinalityAlgo from './algos/MaximumCardinalityAlgo';
import Classroom from './models/entities/Classroom';

(async function() {   
    // Add logger global
    globalThis.$logger = Logger;
    globalThis.$config = Config;

    // Load dataset
    await Input.loadDataset('dockinga-ob17-03-2022');

    // Setup entities global
    globalThis.$periods = new PeriodController();
    globalThis.$teachers = new TeacherController();
    globalThis.$subjects = new SubjectController();
    globalThis.$classrooms = new ClassroomController();
    globalThis.$students = new StudentController();
    globalThis.$batches = new BatchController();

    const teacherGradeAlgo = new MaximumCardinalityAlgo();
    const proposals = teacherGradeAlgo.solve($batches.all());

    proposals.forEach(proposal => {
        proposal.subject.linkTo(proposal.teacher);
        proposal.grade.linkTo(proposal.subject);
        proposal.grade.linkTo(proposal.teacher);
    })

    // const students = $students.all();
    const students = [ $students.getBy(s => s.config.name === '2_VWO') ];

    Promise.all(students.map(student => {
        const context = {
            student: student
        }
        
        const algo = new WeekAlgo({}, context);

        return algo.start();
    })).then(algos => {
        algos.map(algo => {
            const schedule = algo.result();

            const json: any = {
                id: algo.context.student.config.name,
                meta: {
                    periods: $periods.meta,
                    periodDistrib: $periods.allSortedByMedianDistance().filter(p => p.config.id < 8).map(p => p.id)
                },
                periods: []
            }

            schedule.periods.all().forEach(period => {
                const subject = period.getLink(Subject);
                if(!subject) return;

                // const classroom = period.getLink(Classroom);
                // if(!classroom) {
                //     throw new Error('No classsroom.');
                // }
                
                // const grade = algo.context.student.getLink(Grade);
                // const teacher = grade.getCombiLink(Teacher, subject);
                // if(!teacher) {
                //     throw new Error('No teacher.');
                // }

                // console.log(subject.id, grade.id, teacher.id)

                json.periods.push({
                    period: period.id,
                    // classroom: classroom.id,
                    subject: subject.id,
                    // teacher: teacher.id
                })
            })

            console.log(JSON.stringify(json));
        })
    })
})();