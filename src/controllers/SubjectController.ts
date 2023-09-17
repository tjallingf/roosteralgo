import ControllerClass from '../lib/ControllerClass';
import Input from '../lib/Input';
import Student from '../models/entities/Student';
import Subject from '../models/entities/Subject';
import Batch from '../models/Batch';
import Context from '../lib/Context';

export default class SubjectController extends ControllerClass<Subject>() {
    load() {
        $logger.info('Loading subjects...');

        const subjects = Input.get('subjects');
        subjects.forEach(config => this._storeItem(new Subject(config, this)));
    }

    // TODO: memoize
    allForStudent(student: Student) {
        const context = new Context(student);
        return this.all().filter(subject => context.match(subject.config.periods)! > 0);
    }

    // TODO: memoize
    allForBatch(batch: Batch) {
        const subjects: Record<string, Subject> = {}

        batch.getLinks(Student).forEach(student => {
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