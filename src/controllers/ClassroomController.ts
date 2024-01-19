import ControllerClass from '../lib/ControllerFactory';
import Input from '../lib/Input';
import Classroom, { ClassroomConfig } from '../models/entities/Classroom';

export default class ClassroomController extends ControllerClass<Classroom>() {
    load() {
        const classrooms = Input.get('classrooms');
        classrooms.forEach((config: ClassroomConfig) => this.store(new Classroom(config, this)));
    }
}