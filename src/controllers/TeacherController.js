const ControllerClass = require('../lib/ControllerClass');
const Input = require('../lib/Input');
const Teacher = require('../models/Teacher');

module.exports = class TeacherController extends ControllerClass() {
    static load() {
        const teachers = Input.get('teachers');
        teachers.forEach(config => this._storeItem(new Teacher(config)));
    }
}