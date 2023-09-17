import Schedule from './Schedule';

export default class Week {
    schedules: Record<string, Schedule> = {};

    constructor() {}

    init() {
        $students.all().forEach(student => {
            const schedule = new Schedule(student);
            this.schedules[student.id] = schedule;
        })
    }
}