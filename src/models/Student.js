import Person from './Person';
import subjects from '../registers/subjects';

export default class Student extends Person {
    #hasSubjectFlags;

    constructor(config) {
        this.#hasSubjectFlags = [];
    }

    hasSubject(subject) {
        return subject.hasStudent(this);
    }

    getSubjects() {
        return this.#hasSubjectFlags.map(f => subjects.getByFlag(f));
    }
}