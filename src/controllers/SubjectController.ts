import ControllerClass from '../lib/ControllerFactory';
import Input from '../lib/Input';
import Student from '../models/entities/Student';
import Subject from '../models/entities/Subject';
import Batch from '../models/entities/Batch';
import Context from '../lib/Context';

export default class SubjectController extends ControllerClass<Subject>() {
    load() {
        // $logger.info('Loading subjects...');

        const subjects = Input.get('subjects');
        subjects.forEach(config => this.store(new Subject(config, this)));

        $students.all().forEach(student => {
            student.config.subjects.forEach(subjectId => {
                if(subjectId === 'LTC' && student.config.subjects.includes('GEL')) return;

                // Get the subject
                const subject = this.get(subjectId);

                // Create context
                const context = new Context(student);

                // Check if the number or periods is at least 1
                if(context.match(subject.config.periods)! >= 1) {
                    student.linkTo(subject);
                    student.__curriculumFlag |= subject.bitmask;
                }
            })
        })
    }

    allForStudent(student: Student) {
        return student.getLinks(Subject);
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