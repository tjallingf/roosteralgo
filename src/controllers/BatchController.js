const ControllerClass = require('../lib/ControllerClass');
const Config = require('../lib/Config');

module.exports = class BatchController extends ControllerClass() {
    static create() {
        const studentsByGroup = this._allStudentsByGroup();

        const groups = [];

        studentsByGroup.forEach(group => {
            this._createBatch(group);
        })
    }

    static _createBatch(group) {
        const numberOfBatches = Math.ceil(group.students.length / Config.get('STUDENTS_PER_BATCH_MAX'));
        if(numberOfBatches <= 1) {
            return [ group.students ];
        }

        const studentsSortedByCurriculumHashDiff = group.students.sort((a, b) => a.curriculumHash < b.curriculumHash ? -1 : 1);
        // console.log(JSON.stringify(studentsSortedByCurriculumHashDiff)+'\r\n\r\n');
    }

    static _allStudentsByGroup() {
        const byGroup = {};

        STUDENTS.all().forEach(student => {
            if(!byGroup[student.groupId]) {
                byGroup[student.groupId] = [];
            }

            byGroup[student.groupId].push(student);
        })

        return Object.entries(byGroup).map(([ id, students ]) => ({
            id, students
        }));
    }
}