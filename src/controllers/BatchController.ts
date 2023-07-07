import Subject from '../models/entities/Subject';
import ControllerClass from '../lib/ControllerClass';
import Grade from '../models/Grade';

export default class BatchController extends ControllerClass<Grade>() {
    load() {
        $students.all().forEach(student => {
            const grade = new Grade({ 
                level: student.config.level,
                year: student.config.year
            }, this);

            if(this.getOrFail(grade.id)) {
                return true;
            }

            grade.linkTo(student);
            this._storeItem(grade);
        })

        $logger.info(`Built ${this.all().length} grades.`);
    }
}