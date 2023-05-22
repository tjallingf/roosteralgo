export default class Subject {
    _students = {};

    addStudent(student) {
        this.students[student.id] = student;
    }

    hasStudent(student) {
        return !!this.students[student.id];
    }

    getStudents() {
        return Object.values(this._students);
    }
}