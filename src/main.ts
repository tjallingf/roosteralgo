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
import TeacherBatchAlgo from './algos/TeacherBatchMaxCardAlgo';
import Renderer from './lib/Renderer';
import * as _ from 'lodash';
import GradeController from './controllers/GradeController';

(async function() {   
    // Add logger global
    globalThis.$logger = Logger;
    globalThis.$config = Config;

    // Load dataset
    await Input.loadDataset('dockinga17-03-2022');

    const algo = new MasterAlgo({});
    algo.start();

    const result = algo.result();
    result.students.all().forEach(student => {
        const renderer = new Renderer(result, student);
        renderer.saveHTML();
    })

    // result.teachers.all().forEach(teacher => {
    //     const renderer = new Renderer(result, teacher);
    //     renderer.saveHTML();
    // })

    // const renderer = new Renderer(algo.result());
    // renderer.saveHTML();
})();