import BatchController from '../controllers/BatchController';
import { xor } from '../lib/utils';
import Batch from '../models/entities/Batch';
import StableMarriageAlgo from './StableMarriageAlgo';

export default class CompatibleBatchLinkAlgo extends StableMarriageAlgo<Batch, BatchController> {
    constructor() {
        super($batches);
    }

    fitness(x: Batch, y: Batch) {
        if(!x.isCompatibleWith(y)) return 0;
        if(x.getTeacher() === y.getTeacher()) return 0;
        if(x.getGrade() !== y.getGrade()) return 0;
        // if(x.getSubject().hasTag('BLOCK_MEETINGS') || y.getSubject().hasTag('BLOCK_MEETINGS')) return 0;
        
        // Subjects with block meetings can not be linked to normal subjects
        if(xor(x.getSubject().needsBlockMeetings(), y.getSubject().needsBlockMeetings())) return 0;

        let fitness = 1;
        
        const meetingCountDiff = Math.abs(x.getMeetingCount() - y.getMeetingCount());
        fitness -= meetingCountDiff/20;

        return fitness;
    }
}