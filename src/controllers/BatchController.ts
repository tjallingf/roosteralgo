import Subject from '../models/entities/Subject';
import ControllerClass from '../lib/ControllerClass';
import Batch from '../models/Batch';
import Student from '../models/entities/Student';
import Grade from '../models/entities/Grade';
import _ from 'lodash';
import Week from '../Week';

export default class BatchController extends ControllerClass<Batch>() {
    load() {
        // For storing the total number of students in each grade
        const studentsByGrade: Record<string, Student[]> = {};

        this.week.students.all().forEach(student =>{
            const gradeId = student.getGradeId();
            studentsByGrade[gradeId] ??= [];
            studentsByGrade[gradeId].push(student);
        })

        this.week.subjects.all().forEach(subject => {
            // Loop all students per grade
            _.forOwn(studentsByGrade, allStudents => {
                // Find students that take the given subject
                const students = allStudents.filter(s => s.isLinkedTo(subject));
                
                // Skip if no students matched
                if(!students.length) return;

                // Calculate the number of students per batch
                const batchCount = Math.ceil(students.length / $config.get('STUDENTS_PER_BATCH_TARGET'));
                const studentsPerBatchCount = Math.ceil(students.length / batchCount);
                
                // Get year and level of the batch number
                const grade = students[0].getLink(Grade);

                // For storing the current 
                let batchNumber = 0;

                // Place all students in a batch
                while(students.length > 0) {
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

                    // Store the batch
                    this._storeItem(batch);
                    batchNumber++;
                }
            })

            $logger.info(`Built ${this.all().filter(b => b.config.subject === subject).length} batches for ${subject.id}.`);
        })

        $logger.info(`Built ${this.all().length} batches in total.`)
    }
}