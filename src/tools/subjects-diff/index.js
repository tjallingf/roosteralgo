const fs = require('fs');

const CELL_SEPERATOR = ',';
const $students = JSON.parse(fs.readFileSync('./students.json', 'utf8'));

// Generate a list of all subject ids
let subjects = [];
$students.forEach(({ config }) => {
    subjects = subjects.concat(config.subjects);
})
subjects = subjects.filter((v, i, arr) => arr.indexOf(v) === i);

let matrix = [
    subjects
];
subjects.forEach((subject, i) => {
    matrix[i+1] = [ subject ];
})

$students.forEach(({ config }, i) => {
    matrix[].push(subjects.map((subjectId) => {
        return config.subjects.includes(subjectId) ? i : undefined;
    }))
})

// const rotated = matrix[0].map((val, index) => matrix.map(row => row[row.length-1-index]));

const csvData = matrix.map((line, i) => {
    return line.join(CELL_SEPERATOR)
}).join('\r\n');
fs.writeFileSync('./diff.csv', csvData, 'utf8');