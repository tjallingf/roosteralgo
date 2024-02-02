import ControllerClass from '../lib/ControllerFactory';
import Input from '../lib/Input';
import Teacher from '../models/entities/Teacher';

export default class TeacherController extends ControllerClass<Teacher>() {
    load() {
        // $logger.info('Loading teachers...');

        const teachers = Input.get('teachers');
        teachers.forEach(config => {
            const teacher = new Teacher(config, this);
            this.store(teacher)
        });
    }
}