import Schedule from './Schedule';
import BatchController from './controllers/BatchController';
import ClassroomController from './controllers/ClassroomController';
import GradeController from './controllers/GradeController';
import StudentController from './controllers/StudentController';
import SubjectController from './controllers/SubjectController';
import TeacherController from './controllers/TeacherController';
import TeacherBatchMaxCardAlgo from './algos/TeacherBatchMaxCardAlgo';

export default class Week {
    schedules: Record<string, Schedule> = {};
    students: StudentController;
    subjects: SubjectController;
    classrooms: ClassroomController;
    batches: BatchController;
    grades: GradeController;
    teachers: TeacherController;

    constructor() {
        this.teachers = new TeacherController(this);
        this.students = new StudentController(this);
        this.subjects = new SubjectController(this);
        this.grades = new GradeController(this);
        this.classrooms = new ClassroomController(this);
        this.batches = new BatchController(this);
                
        const teacherBatchAlgo = new TeacherBatchMaxCardAlgo(this.batches);
        const proposals = teacherBatchAlgo.solve();

        proposals.forEach(proposal => {
            proposal.batch.linkTo(proposal.teacher);
        })
    }

    init() {
        this.batches.all().forEach(batch => {
            const schedule = new Schedule(this, batch);
            this.schedules[batch.id] = schedule;
        })
    }
}