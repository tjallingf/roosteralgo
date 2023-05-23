const EssentialEntity = require('./EssentialEntity');

module.exports = class Student extends EssentialEntity {
    curriculumHash;
    groupId;

    constructor(config) {
        super(config);

        this.config.subjects.forEach(subjectId => {
            const subject = SUBJECTS.getById(subjectId);
            subject.addStudent(this);
        })

        this.groupId = `${this.config.year}_${this.config.education}`;
    }

    hasSubject(subject) {
        return (this.curriculumHash & subject.flag) > 0;
    }

    getSubjects() {
        return this.config.subjects.map(id => SUBJECTS.getById(id));
    }

    _generateCurriculumHash() {
        let hash = 0;

        this.getSubjects().forEach(s => {
            hash += s.flag;
        })

        this.curriculumHash = hash;
    }
}