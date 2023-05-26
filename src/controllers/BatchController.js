const ControllerClass = require('../lib/ControllerClass');
const Config = require('../lib/Config');
const { chunkify } = require('../lib/utils')

module.exports = class BatchController extends ControllerClass() {
    static create() {
        const studentsByGroup = this._allStudentsByGroup();

        const groups = [];

        studentsByGroup.forEach(group => {
            this._createBatches(group);
        })
    }

    static _createBatches(group) {
        const maxStudentsPerBatch = Config.get('STUDENTS_PER_BATCH_MAX');
        const targetNumberOfBatches = Math.round(group.students.length / maxStudentsPerBatch);

        return chunkify(group, targetNumberOfBatches)
        
        // const studentsSortedByCurriculumHashDiff = group.students.sort((a, b) => a.curriculumHash < b.curriculumHash ? -1 : 1);
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