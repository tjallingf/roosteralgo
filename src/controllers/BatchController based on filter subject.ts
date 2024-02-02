import Subject from '../models/entities/Subject';
import ControllerClass from '../lib/ControllerFactory';
import Batch from '../models/entities/Batch';
import Student from '../models/entities/Student';
import Grade from '../models/Grade';
import _, { filter } from 'lodash';

export default class BatchController extends ControllerClass<Batch>() {
    load() {
        $grades.all().forEach(grade => {
            $subjects.all().forEach(subject => {
                // Find students that take the given subject
                let allStudents = grade.getStudents().filter(stu => stu.takesSubject(subject));

                // Skip if no students matched
                if (!allStudents.length) return;
                
                // Calculate the number of students per batch
                const batchCount = Math.ceil(allStudents.length / $config.get('studentsPerBatchTarget'));
                
                const batchesToCreate: Student[][] = [];
                if(batchCount === 1) {
                    batchesToCreate.push(allStudents);
                } else {                   
                    const studentsPerBatchTarget = Math.ceil(allStudents.length / batchCount);

                    let remainingStudents = [...allStudents];
                    for (let i = 0; i < batchCount; i++) {
                        const isLastBatch = (i === batchCount-1);

                        if(isLastBatch) {
                            batchesToCreate.push(remainingStudents);
                            break;
                        }

                        let filter: { commonStudents: Student[], subject?: Subject, fitness: number } = { commonStudents: [], fitness: 0 };
                       
                        $subjects.all().forEach(subject2 => {
                            const commonStudents = remainingStudents.filter(stu => stu.takesSubject(subject2));
                            const fitness = 1/(allStudents.length - (commonStudents.length * batchCount));

                            if(filter.fitness < fitness) {
                                filter = { commonStudents, subject: subject2, fitness: fitness };
                            }
                        });

                        if(filter.subject && filter.commonStudents.length > 0) {
                            batchesToCreate.push(filter.commonStudents);
                            remainingStudents = remainingStudents.filter(stu => !filter.commonStudents.includes(stu));
                        } else {
                            batchesToCreate.push(remainingStudents.splice(0, studentsPerBatchTarget))
                        }
                    }
                }

                batchesToCreate.forEach((students, i) => {
                    const batch = new Batch({
                        grade: grade,
                        subject: subject,
                        number: i
                    }, this);

                    students.forEach(student => {
                        student.linkTo(batch);
                    })

                    this.store(batch);

                    $logger.info(`Created batch ${batch.id} with ${batch.getStudents().length} students.`);
                })
            })
        })

        $logger.info(`Built ${this.all().length} batches in total.`)
    }
}