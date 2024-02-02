import Entity from '../models/Entity';

export type Proposal<Tx, Ty> = [ Tx, Ty, number ];

export default abstract class MaximumCardinalityAlgo<Tx extends Entity, Ty extends Entity> {
    protected proposals: Record<string, Proposal<Tx, Ty>> = {};

    abstract fitness(x: Tx, y: Ty): number;
    abstract solve(): void;

    getProposals() {
        return Object.values(this.proposals);
    }

    propose(x: Tx, y: Ty) {
        const fitness = this.fitness(x, y);
        const proposal = this.proposals[x.id];

        if(!proposal || proposal[2] <= fitness) {
            this.proposals[x.id] = [ x, y, fitness ];
            return true;
        }

        return false;
    }
}