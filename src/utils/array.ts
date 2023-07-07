export function arrayAverage(arr: number[]) {
    return (arr.reduce((acc, cur) => acc += cur, 0) / arr.length);
}