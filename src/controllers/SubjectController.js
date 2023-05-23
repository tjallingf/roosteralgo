const ControllerClass = require('../lib/ControllerClass');
const Input = require('../lib/Input');
const Subject = require('../models/Subject');

module.exports = class SubjectsController extends ControllerClass() {
    static load() {
        const subjects = Input.get('subjects');
        subjects.forEach(config => this._storeItem(new Subject(config)));
    }

    static allSortedByPopularity() {
        return this.all().sort((a, b) => 
            a.getStudents().length > b.getStudents().length ? -1 : 1);
    }
    
    static _generateFlags() {
        console.log(1, this.allSortedByPopularity());
        this.allSortedByPopularity().reverse().forEach((subject, i) => {
            subject.flag = Math.pow(2, i);
        })
    }
}