import ControllerClass from '../lib/ControllerClass';
import Input from '../lib/Input';
import Classroom, { ClassroomConfig } from '../models/entities/Classroom';

export default class ClassroomController extends ControllerClass() {
    load() {
        const classrooms = Input.get('classrooms');
        classrooms.forEach((config: ClassroomConfig) => this._storeItem(new Classroom(config, this)));
    }
}