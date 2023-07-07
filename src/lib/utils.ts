export const weightedAverage = (...sets: [number, number][]) => {
    const [weightSum, valueSum] = sets.reduce(([ weightAcc, valueAcc ], [ weight, value ]) => {
        weightAcc += weight;
        valueAcc += weight * value;

        return [ weightAcc, valueAcc ];
    }, [ 0, 0 ]);

    return valueSum / weightSum;
}

// Source: https://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
const chunkify = (a, n, balanced) => {
    if (n < 2)
        return [a];

    var len = a.length,
            out: any[] = [],
            i = 0,
            size;

    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push(a.slice(i, i += size));
        }
    }

    else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, i += size));
        }
    }

    else {

        n--;
        size = Math.floor(len / n);
        if (len % size === 0)
            size--;
        while (i < size * n) {
            out.push(a.slice(i, i += size));
        }
        out.push(a.slice(size * n));

    }

    return out;
}

export { chunkify };