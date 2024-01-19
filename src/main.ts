import Input from './lib/Input';
import Config from './lib/Config';
import Logger from './lib/Logger';
import MasterAlgo from './lib/MasterAlgo';
import Renderer from './lib/Renderer';
import * as _ from 'lodash';
import StudentController from './controllers/StudentController';
import GradeController from './controllers/GradeController';
import TeacherController from './controllers/TeacherController';
import SubjectController from './controllers/SubjectController';
import BatchController from './controllers/BatchController';
import ClassroomController from './controllers/ClassroomController';
import PeriodController from './controllers/PeriodController';
import TeacherBatchLinkAlgo from './algo/TeacherBatchLinkAlgo';
import CompatibleBatchLinkAlgo from './algo/CompatibleBatchLinkAlgo';

globalThis.log = false;

(async function() {   
    // Add logger global
    globalThis.$logger = Logger;
    globalThis.$config = Config;

    // Load dataset
    await Input.loadDataset('dockinga17-03-2022');

    // Add controllers
    globalThis.$students = new StudentController(); $students.load();
    globalThis.$grades = new GradeController(); $grades.load();
    globalThis.$teachers = new TeacherController(); $teachers.load();
    globalThis.$subjects = new SubjectController(); $subjects.load();
    globalThis.$batches = new BatchController(); $batches.load();
    globalThis.$classrooms = new ClassroomController(); $classrooms.load();
    globalThis.$periods = new PeriodController(); $periods.load();

    // Assign teachers to batches
    const teacherBatchLinks = new TeacherBatchLinkAlgo();
    teacherBatchLinks.solve();

    teacherBatchLinks.getProposals().forEach(([ batch, teacher ]) => {
        batch.linkTo(teacher);
    })
    
    // Link batches that are most compatible
    const bestCompatibleBatchLinks = new CompatibleBatchLinkAlgo();
    bestCompatibleBatchLinks.solve();

    bestCompatibleBatchLinks.getCouples().forEach(([ proposer, partner ]) => {
        proposer.setBestCompatible(partner);
    })

    const algo = new MasterAlgo({
        crossoverChance: 0,
        mutateChance: 0.7,
        size: 1,
        eliteSize: 1,
        iterations: 1,
        tournamentSize: 3
    });

    const start = Date.now();
    algo.start();
    const end = Date.now();

    const result = algo.result();
    const durationSeconds = Math.round((end-start)/1000);
    console.log('Final result with fitness', result.getFitness(), 'found after', durationSeconds+'s.')

    result.getMeetings().forEach(meeting => {
        const fitness = meeting.getFitnessForPeriod(meeting.getPeriod());
        const scores = fitness.getScores();
        if(scores.TEACHER_AVAILABLE < 1 || scores.STUDENTS_AVAILABLE < 1) {
            console.log('Meeting', meeting.id, 'on period', meeting.getPeriod().id, 'has one or more conflicts', scores, fitness.getFloat());
        }
    })

    $batches.all().forEach(batch => {
        const renderer = new Renderer(result, batch);
        renderer.saveHTML();
    })

    $grades.all().forEach(grade => {
        const renderer = new Renderer(result, grade);
        renderer.saveHTML();
    })

    $students.all().forEach(student => {
        const renderer = new Renderer(result, student);
        renderer.saveHTML();
    })
    
    $teachers.all().forEach(teacher => {
        const renderer = new Renderer(result, teacher);
        renderer.saveHTML();
    })
})();