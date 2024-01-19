import _ from 'lodash';

export default class FitnessManager {
    protected constraints: Record<string, boolean> = {};
    protected scores: Record<string, number> = {};

    addHardConstraint(id: string, initialValue: number) {
        return this.addConstraint(id, initialValue, true);
    }

    addSoftConstraint(id: string, initialValue: number) {
        return this.addConstraint(id, initialValue, false);
    }

    addConstraint(id: string, initialValue: number, isHard: boolean = false) {
        this.constraints[id] = isHard;
        this.scores[id] = initialValue;
        return this;
    }

    set(id: string, value: number) {
        if(typeof this.constraints[id] !== 'boolean') throw new Error(`Invalid field: '${id}'.`);
        this.scores[id] = value;
    }

    getFloat() {
        let totalScore = 0;
        let totalWeight = 0;

        _.forOwn(this.scores, (score, id) => {
            const isHard = this.constraints[id];
            const weight = isHard ? 10 : 1;

            totalWeight += weight;
            totalScore  += score * weight;
        })

        return totalScore / totalWeight;
    }

    getScores() {
        return this.scores;
    }
}