import _ from 'lodash';
import ControllerClass from '../lib/ControllerFactory';
import Input from '../lib/Input';
import Grade from '../models/Grade';

export default class GradeController extends ControllerClass<Grade>() {
    load() {
        this.allSorted = _.memoize(this.allSorted);

        // $logger.info('Loading grades...');

        const Grades = Input.get('grades');
        const grades: Record<string, Grade> = {};
        $students.all().forEach(student => {
            const gradeId = `${student.config.year}_${student.config.level}`;

            if(!grades[gradeId]) {
                grades[gradeId] = new Grade({ year: student.config.year, level: student.config.level }, this);
                this.store(grades[gradeId]);
            }

            grades[gradeId].linkTo(student);
        })
    }

    allSorted() {
        return _.sortBy(this.all(), g => g.config.level);
    }
}