import _ from 'lodash';

export type FitnessHandler<TItem> = (item: TItem) => unknown;

export default class FitnessManager<TItem> {
    protected items: TItem[];
    protected values: Record<number, number> = {};
    protected blocks: { handler: FitnessHandler<TItem>, weight: number}[] = [];
    protected currentBlockIndex: number;

    constructor(items: TItem[]) {
        this.items = items;
    }

    addBlock(handler: FitnessHandler<TItem>, weight: number) {
        this.blocks.push({ handler, weight });
    }

    add(value: number = 1) {
        return this.change(value);
    }

    subtract(value: number = 1) {
        return this.change(-value);
    }

    get() {
        this.run();
        return this.calculateResult();
    }

    protected calculateResult() {
        let totalValue = 0;
        let totalWeight = 0;

        _.forOwn(this.values, (value, key) => {
            const weight = this.blocks[key].weight;
            totalValue += weight * value;
            totalWeight += weight;
        })

        return totalValue / totalWeight;
    }

    change(value: number) {
        if(typeof value !== 'number') {
            throw new Error('Fitness value must be a number.');
        }

        this.values[this.currentBlockIndex] += value;
    }

    protected run() {
        this.items.forEach(item => {
            this.blocks.forEach((block, i) => {
                this.currentBlockIndex = i;
                this.values[this.currentBlockIndex] = 0;

                block.handler(item);
            })
        })
    }
}