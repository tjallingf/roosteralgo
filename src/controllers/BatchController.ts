import Subject from '../models/entities/Subject';
import ControllerClass from '../lib/ControllerClass';
import Batch from '../models/Batch';
import Student from '../models/entities/Student';
import _ from 'lodash';

export default class BatchController extends ControllerClass<Batch>() {
    load() {
        $subjects.all().forEach(subject => {
            // For storing the total number of students for each batch
            const studentsPerGrade: Record<string, Student[]> = {};

            // Find the total number of students for each batch
            $students.all().forEach(student => {
                // Skip the student if they don't have the subject.
                if(!student.config.subjects.includes(subject.id)) return;

                const gradeId = student.getGradeId();
                studentsPerGrade[gradeId] ??= [];
                studentsPerGrade[gradeId].push(student)
            })
            
            // Loop all students per grade
            _.forOwn(studentsPerGrade, students => {
                // The number of students per batch
                const batchCount = Math.ceil(students.length / $config.get('STUDENTS_PER_BATCH_TARGET'));
                const studentsPerBatchCount = students.length / batchCount;
                
                const config = students[0].config;

                // Place all students in a batch
                while(students.length > 0) {
                    // Create a new batch
                    const batch = new Batch({
                        year: config.year,
                        level: config.level,
                        subject: subject
                    }, this);

                    // Take `studentsPerBatchCount` students, add them to the batch and remove them
                    // from the `students` array.
                    students.splice(0, studentsPerBatchCount).forEach(student => {
                        batch.linkTo(student);
                    })

                    // Store the batch
                    this._storeItem(batch);
                }
            })

            $logger.info(`Built ${this.all().filter(b => b.config.subject === subject).length} batches for ${subject.id}.`);
        })

        $logger.info(`Built ${this.all().length} batches in total.`)
    }
}