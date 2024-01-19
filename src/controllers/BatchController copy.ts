import Subject from '../models/entities/Subject';
import ControllerClass from '../lib/ControllerFactory';
import Batch from '../models/entities/Batch';
import Student from '../models/entities/Student';
import Grade from '../models/Grade';
import _ from 'lodash';

export default class BatchController extends ControllerClass<Batch>() {
    load() {
        $grades.all().forEach(grade => {
            const subjectsWithStudents = $subjects.all().map(subject => {
                const students = grade.getStudents().filter(stu => stu.takesSubject(subject));
                return { subject, students };
            });
            const subjectsByPopularity = _.sortBy(subjectsWithStudents, ({ students }) => students.length);

            subjectsByPopularity.forEach(({ subject, students }, i) => {
                // Skip if no students matched
                if (!students.length) return;

                // Calculate the number of students per batch
                const batchCount = Math.ceil(students.length / $config.get('studentsPerBatchTarget'));
                const studentsPerBatchCount = Math.ceil(students.length / batchCount);

                // // 60
                // // 40
                // // 20

                // const bestFilter = _.chain(subjectsByPopularity)
                //     .minBy(({ students: students2 }) => Math.abs((students.length % studentsPerBatchCount) - (students2.length % studentsPerBatchCount)))
                //     .value();

                // console.log(grade.id, [subject.id, students.length], [bestFilter?.subject?.id, bestFilter?.students?.length]);
                // let studentList = [...students];
                // if(bestFilter?.subject) {
                //     studentList = _.sortBy(students, stu => stu.takesSubject(bestFilter.subject) ? 0 : 1);
                // }

                let studentList = [...students];

                // For storing the current batch number
                let batchNumber = 0;

                // Place all students in a batch
                while (studentList.length > 0) {
                    // Create a new batch
                    const batch = new Batch({
                        grade: grade,
                        subject: subject,
                        number: batchNumber
                    }, this);

                    // Take `studentsPerBatchCount` students, add them to the batch and remove them
                    // from the `students` array.
                    studentList.splice(0, studentsPerBatchCount).forEach(student => {
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