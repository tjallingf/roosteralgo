import Logger from '../src/lib/Logger';
import Config from '../src/lib/Config';
import TeacherController from '../src/controllers/TeacherController';
import StudentController from '../src/controllers/StudentController';
import SubjectController from '../src/controllers/SubjectController';
import PeriodController from '../src/controllers/PeriodController';
import GradeController from '../src/controllers/GradeController';
import BatchController from '../src/controllers/BatchController';
import ClassroomController from '../src/controllers/ClassroomController';

declare global {   
    var $logger: typeof Logger;
    var $config: typeof Config;
    var $students: StudentController;
    var $grades: GradeController;
    var $teachers: TeacherController;
    var $subjects: SubjectController;
    var $batches: BatchController;
    var $classrooms: ClassroomController;
    var $periods: PeriodController;
}

export {};