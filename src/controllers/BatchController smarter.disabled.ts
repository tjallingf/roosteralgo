import Subject from '../models/entities/Subject';
import ControllerClass from '../lib/ControllerFactory';
import Batch from '../models/entities/Batch';
import Student from '../models/entities/Student';
import Grade from '../models/Grade';
import _ from 'lodash';

export default class BatchController extends ControllerClass<Batch>() {
    load() {
        // Create a matrix
        const matrix: Record<string, Record<string, Record<string, number[]>>> = {};
        $grades.all().forEach(grade => {
            $subjects.all().forEach(a => {
                $subjects.all().forEach(b => {
                    const students = grade.getStudents().filter(s => s.takesSubject(a) && s.takesSubject(b));
                    _.set(matrix, `${grade.id}.${a.id}.${b.id}`, students.map(s => s.id));
                })
            })
        })

        $grades.all().forEach(grade => {           
            $subjects.all().forEach(subject => {
                const students = grade.getStudents().filter(s => s.takesSubject(subject));
                if(students.length === 0) return;

                // Get a list of subjects that `subject` is compatible with.
                const compatibleSubjects: { subject2: Subject, students2: Student[] }[] = [];
                _.each(matrix[grade.id][subject.id], (studentIds, subjectId) => {
                    if(studentIds.length !== 0) return;
                    const subject2 = $subjects.get(subjectId);
                    const students2 = grade.getStudents().filter(s => s.takesSubject(subject2))
                    compatibleSubjects.push({ subject2, students2 });
                })

                // Find the most compatible subject, i.e. with the most similar number of students.
                const mostCompatibleSubject = _.chain(compatibleSubjects)
                    .filter(({ students2 }) => students2.length > 0)
                    .minBy(({ students2 }) => Math.abs(students.length - students2.length))
                    .value()?.subject2;
                    
                // Calculate the number of students per batch
                const batchCount = Math.ceil(students.length / $config.get('studentsPerBatchTarget'));
                const studentsPerBatchCount = Math.ceil(students.length / batchCount);

                // For storing the current 
                let attempt = 0;

                // Place all students in a batch
                while(students.length > 0) {
                    if(mostCompatibleSubject) {
                        
                    }
                }
            })

            // $logger.info(`Built ${this.all().filter(b => b.config.subject === subject).length} batches for ${subject.id}.`);
        })

        // $logger.info(`Built ${this.all().length} batches in total.`)
    }
}