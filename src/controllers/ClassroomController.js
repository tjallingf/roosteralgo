const ControllerClass = require('../lib/ControllerClass');
const Input = require('../lib/Input');
const Classroom = require('../models/Classroom');

module.exports = class ClassroomController extends ControllerClass() {
    static load() {
        const classrooms = Input.get('classrooms');
        classrooms.forEach(config => this._storeItem(new Classroom(config)));
    }
}