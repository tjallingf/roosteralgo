const Entity = require('./Entity');

module.exports = class Subject extends Entity {
    #students = {};

    /** 
     * @type {number} 
     * The flag is set by the SubjectsController.
     */
    flag;

    constructor(config) {
        super(config.id, config);

        STUDENTS.all().forEach(student => {
            if(!student.hasSubject(this)) {
                return;
            }

            this.addStudent(student);
        })
    }

    addStudent(student) {
        this.#students[student.id] = student;
    }

    hasStudent(student) {
        return !!this.#students[student.id];
    }

    getStudents() {
        return Object.values(this.#students);
    }
}