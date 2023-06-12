const EssentialEntity = require('./EssentialEntity');

module.exports = class Batch extends EssentialEntity {
    #students = {};

    addStudent(student) {
        this.#students[student.id] = student;
    }

    hasStudent(student) {
        return !!this.#students[student.id];
    }

    students() {
        return Object.values(this.#students);
    }
}