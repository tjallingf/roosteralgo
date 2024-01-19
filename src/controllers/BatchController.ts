import Subject from '../models/entities/Subject';
import ControllerClass from '../lib/ControllerFactory';
import Batch from '../models/entities/Batch';
import Student from '../models/entities/Student';
import Grade from '../models/Grade';
import _ from 'lodash';

export default class BatchController extends ControllerClass<Batch>() {
    load() {
        $grades.all().forEach(grade => {
            $subjects.all().forEach(subject => {
                // Find students that take the given subject
                const students = grade.getStudents().filter(stu => stu.takesSubject(subject));

                // Skip if no students matched
                if (!students.length) return;

                // Calculate the number of students per batch
                const batchCount = Math.ceil(students.length / $config.get('studentsPerBatchTarget'));
                const studentsPerBatchCount = Math.ceil(students.length / batchCount);

                let batchNumber = 0;

                // Place all students in a batch
                while (students.length > 0) {
                    // Create a new batch
                    const batch = new Batch({
                        grade: grade,
                        subject: subject,
                        number: batchNumber
                    }, this);

                    // Take `studentsPerBatchCount` students, add them to the batch and remove them
                    // from the `students` array.
                    students.splice(0, studentsPerBatchCount).forEach(student => {
                        batch.linkTo(student);
                    })

                    $logger.info(`Created batch ${batch.id} with ${batch.getStudents().length} students.`);

                    // Store the batch
                    this.store(batch);
                    batchNumber++;
                }

            })
        })

        $logger.info(`Built ${this.all().length} batches in total.`)
    }
}