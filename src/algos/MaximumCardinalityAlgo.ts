import Teacher from '../models/entities/Teacher';
import Subject from '../models/entities/Subject';
import Grade from '../models/Grade';
import { weightedAverage } from '../lib/utils';

export interface Proposal {
    gradeId: string;
    subjectId: string;
    teacherId: string;
};

export default class MaximumCardinalityAlgo {
    solve(grades: Grade[]) {
        const proposals: Proposal[] = [];

        grades.forEach(grade => {
            if(proposals.some(p => p.gradeId === grade.id)) return true;

            const subjects = $subjects.allForGrade(grade);
            subjects.forEach(subject => {
                const teachers = subject.getLinks(Teacher);
                
                let fittest: { fitness: number, teacher: Teacher } | undefined;
                teachers.forEach(teacher => {
                    let isFitter = false;

                    let fitness = teacher.getFitnessForGrade(grade);
                    const teacherProposalCount = proposals.filter(p => p.teacherId === teacher.id).length; 
                    const fittestTeacherProposalCount = proposals.filter(p => p.teacherId === fittest?.teacher.id).length; 

                    if(!fittest || teacherProposalCount < fittestTeacherProposalCount || fitness > fittest.fitness) {
                        fittest = { fitness, teacher };
                        isFitter = true;
                    }
                })

                if(fittest! && fittest.teacher) {
                    proposals.push({ gradeId: grade.id, subjectId: subject.id, teacherId: fittest.teacher.id });
                }
            })
        })

        return proposals.map(proposal => ({
            grade: $batches.get(proposal.gradeId),
            teacher: $teachers.get(proposal.teacherId),
            subject: $subjects.get(proposal.subjectId)
        }))
    }
}