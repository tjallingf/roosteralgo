const Input = require('./lib/Input');
const Logger = require('./lib/Logger');
const ClassroomController = require('./controllers/ClassroomController');
const SubjectController = require('./controllers/SubjectController');
const StudentController = require('./controllers/StudentController');
const BatchController = require('./controllers/BatchController');


// Add logger global
globalThis.LOGGER = Logger;

// Setup entities global
globalThis.CLASSROOMS = ClassroomController;
globalThis.STUDENTS = StudentController;
globalThis.SUBJECTS = SubjectController;
globalThis.GROUPS = GroupController;

(async function() {
    await Input.loadDataset('dockinga-ob17-03-2022');

    CLASSROOMS.load();
    SUBJECTS.load();
    TEACHERS.load();
    STUDENTS.load();
    BATCHES.load();
})();