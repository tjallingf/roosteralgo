import StudentController from '../src/controllers/StudentController';
import TeacherController from '../src/controllers/TeacherController';
import SubjectController from '../src/controllers/SubjectController';
import ClassroomController from '../src/controllers/ClassroomController';
import PeriodController from '../src/controllers/PeriodController';
import Logger from '../src/lib/Logger';
import Config from '../src/lib/Config';
import BatchController from '../src/controllers/BatchController';

declare global {
    var $students: StudentController;
    var $periods: PeriodController;
    var $teachers: TeacherController;
    var $batches: BatchController;
    var $subjects: SubjectController;
    var $classrooms: ClassroomController;
    
    var $logger: typeof Logger;
    var $config: typeof Config;
}

export {};