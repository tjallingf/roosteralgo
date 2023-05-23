const ControllerClass = require('../lib/ControllerClass');
const Input = require('../lib/Input');
const Student = require('../models/Student');

module.exports = class StudentController extends ControllerClass() {
    static load() {
        const students = Input.get('students');
        students.forEach(config => this._storeItem(new Student(config)));
    }

    static _generateCurriculumHashes() {
        this.all().forEach(s => s._generateCurriculumHash());
    }
}