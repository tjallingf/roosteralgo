const Input = require('./lib/Input');
const Logger = require('./lib/Logger');
const ClassroomController = require('./controllers/ClassroomController');
const SubjectController = require('./controllers/SubjectController');
const StudentController = require('./controllers/StudentController');
const GroupController = require('./controllers/BatchController');


// Add logger global
globalThis.LOGGER = Logger;

// Setup entities global
globalThis.CLASSROOMS = ClassroomController;
globalThis.STUDENTS = StudentController;
globalThis.SUBJECTS = SubjectController;
globalThis.GROUPS = GroupController;

(async function() {
    await Input.loadDataset('dockinga17-03-2022');

    CLASSROOMS.load();
    SUBJECTS.load();
    STUDENTS.load();

    SUBJECTS._generateFlags();
    STUDENTS._generateCurriculumHashes();

    GROUPS.create();
})();