import Teacher from '../models/entities/Teacher';
import Batch, { BatchConfig } from '../models/Batch';
import Context from '../lib/Context';
import BatchController from '../controllers/BatchController';

export interface Proposal {
    teacher: Teacher,
    batch: Batch
}

export default class TeacherBatchMaxCardAlgo {
    protected proposals: Record<string, Proposal>;
    protected batches: BatchController;

    constructor(batches: BatchController) {
        this.batches = batches;
    }

    solve() {
        const proposals: Proposal[] = [];

        this.batches.all().forEach(batch => {
            // Create a new context for the batch
            const context = new Context(batch);

            const teachers = batch.config.subject.getLinks(Teacher);
            
            let fittest: { fitness: number, teacher: Teacher } | undefined;
            teachers.forEach(teacher => {
                let isFitter = false;

                let fitness = teacher.getFitness(context);
                const teacherProposalCount = proposals.filter(p => p.teacher === teacher).length; 
                const fittestTeacherProposalCount = proposals.filter(p => p.teacher === fittest?.teacher).length; 

                if(!fittest || teacherProposalCount < fittestTeacherProposalCount || fitness > fittest.fitness) {
                    fittest = { fitness, teacher };
                    isFitter = true;
                }
            })

            if(fittest! && fittest.teacher) {
                proposals.push({ batch, teacher: fittest.teacher });
            }
        })

        return proposals;
    }
}