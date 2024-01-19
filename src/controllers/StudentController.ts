import _ from 'lodash';
import ControllerClass from '../lib/ControllerFactory';
import Input from '../lib/Input';
import Student from '../models/entities/Student';

export default class StudentController extends ControllerClass<Student>() {
    load() {
        this.allUnique = _.memoize(this.allUnique);

        let students = Input.get('students');
        students = students.filter(stu => stu.year <= 3);
        students.forEach((config: any) => this.store(new Student(config, this)));
    }

    allUnique() {
        return _.uniqBy(this.all(), s => s.getCurriculumFlag());
    }
}