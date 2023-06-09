const ControllerClass = require('../lib/ControllerClass');
const Config = require('../lib/Config');
const { chunkify } = require('../lib/utils');
const StudentController = require('../controllers/StudentController');

module.exports = class BatchController extends ControllerClass() {
    static create() {
        const students = StudentController.all();

        students.forEach(student => {
            const batch = new Batch({
                id: student.id,
                year: student.year,
                level: student.education
            });
            batch.addStudent(student);

            this.storeItem(batch);
        })
    }
}