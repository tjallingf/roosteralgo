import Teacher from '../models/entities/Teacher';
import Batch from '../models/entities/Batch';
import Context from '../lib/Context';
import MaximumCardinalityAlgo from './MaximumCardinalityAlgo';
import _ from 'lodash';

export default class TeacherBatchLinkAlgo extends MaximumCardinalityAlgo<Batch, Teacher> {
    fitness(batch: Batch, teacher: Teacher) {
        const teachers = batch.getSubject().getTeachers();
        const teacherFewestProposals = _.sortBy(teachers, tea => this.getProposals().filter(p => p[1] === tea).length);

        return (
            1 * teacher.getFitness(new Context(batch)) +
            20  * (teacherFewestProposals[0] === teacher ? 1 : 0)
        );
    }

    solve() {
        $batches.all().forEach(batch => {
            const teachers = batch.getSubject().getTeachers();
            
            teachers.forEach(teacher => {          
                this.propose(batch, teacher);
            })
        })

        return this.getProposals();
    }
}