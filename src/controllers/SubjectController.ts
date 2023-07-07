import ControllerClass from '../lib/ControllerClass';
import Input from '../lib/Input';
import Student from '../models/entities/Student';
import Subject from '../models/entities/Subject';
import Grade from '../models/Grade';
import { matchContext } from '../utils/context';

export default class SubjectController extends ControllerClass<Subject>() {
    load() {
        $logger.info('Loading subjects...');

        const subjects = Input.get('subjects');
        subjects.forEach(config => this._storeItem(new Subject(config, this)));
    }

    // TODO: memoize
    allForStudent(student: Student) {
        const grade = student.getLink(Grade);
        const context = { year: grade.config.year, };
        return this.all().filter(subject => matchContext(subject.config.periods, context)! > 0);
    }

    // TODO: memoize
    allForGrade(grade: Grade) {
        const subjects: Record<string, Subject> = {}

        grade.getLinks(Student).forEach(student => {
            const subjectsForStudent = this.allForStudent(student);
            subjectsForStudent.forEach(subject => {
                if(!subjects[subject.id]) {
                    subjects[subject.id] = subject;
                }
            })
        })

        return Object.values(subjects);
    }
}