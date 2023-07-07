import ControllerClass from '../lib/ControllerClass';
import Input from '../lib/Input';
import Student from '../models/entities/Student';

export default class StudentController extends ControllerClass<Student>() {
    load() {
        $logger.info('Loading students...');

        const students = Input.get('students');
        students.forEach(config => this._storeItem(new Student(config, this)));
    }
}