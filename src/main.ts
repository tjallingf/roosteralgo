import Input from './lib/Input';
import Config from './lib/Config';
import Logger from './lib/Logger';
import ClassroomController from './controllers/ClassroomController';
import SubjectController from './controllers/SubjectController';
import StudentController from './controllers/StudentController';
import TeacherController from './controllers/TeacherController';
import PeriodController from './controllers/PeriodController';
import MasterAlgo from './algos/MasterAlgo';
import BatchController from './controllers/BatchController';
import TeacherBatchAlgo from './algos/TeacherBatchAlgo';
import Renderer from './lib/Renderer';
import * as _ from 'lodash';

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

    const teacherBatchAlgo = new TeacherBatchAlgo();
    const proposals = teacherBatchAlgo.solve();

    proposals.forEach(proposal => {
        proposal.batch.linkTo(proposal.teacher);
    })

    const algo = new MasterAlgo({});
    algo.start();

    _.forIn(algo.result().schedules, schedule => {
        const renderer = new Renderer(schedule);

        renderer.saveHTML();
    })

    // const renderer = new Renderer(algo.result());
    // renderer.saveHTML();
})();