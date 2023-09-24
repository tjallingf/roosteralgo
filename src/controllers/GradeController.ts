import ControllerClass from '../lib/ControllerClass';
import Input from '../lib/Input';
import Grade from '../models/entities/Grade';

export default class GradeController extends ControllerClass<Grade>() {
    load() {
        $logger.info('Loading grades...');

        const Grades = Input.get('grades');
        const grades: Record<string, Grade> = {};
        this.week.students.all().forEach(student => {
            const gradeId = `${student.config.year}_${student.config.level}`;

            if(!grades[gradeId]) {
                grades[gradeId] = new Grade({ year: student.config.year, level: student.config.level }, this);
                this._storeItem(grades[gradeId]);
            }

            grades[gradeId].linkTo(student);
        })
    }
}