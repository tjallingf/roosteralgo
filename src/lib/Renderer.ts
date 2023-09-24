import * as path from 'node:path';
import * as fs from 'node:fs';
import Week from '../Week';
import Subject from '../models/entities/Subject';
import Teacher from '../models/entities/Teacher';
import Classroom from '../models/entities/Classroom';
import dayjs from 'dayjs';
import PeriodController from '../controllers/PeriodController';
import Student from '../models/entities/Student';
import Batch from '../models/Batch';

const OUT_DIR = path.resolve('./renders');
const TEMPLATE_PATH = path.resolve('./src/renderer/template.html');
const TEMPLATE_HTML = fs.readFileSync(TEMPLATE_PATH);

export default class Renderer {
    week: Week;
    person: Student | Teacher;

    constructor(week: Week, person: Student | Teacher) {
        this.week = week;
        this.person = person;
    }

    getJSON() {
        const batches = this.person.getLinks(Batch);
        const json: any = {
            id: this.person.id,
            meta: {
                periods: 40,
                periodDistrib: [],
                // periods: this.week.schedules[0].periods.meta,
                // periodDistrib: this.week.periods.allSortedByMedianDistance().filter(p => p.config.id < 8).map(p => p.id)
            },
            periods: []
        }
        
        batches.forEach(batch => {
            const schedule = this.week.schedules[batch.id];
            const periods = schedule.periods.all().filter(p => batch.isLinkedTo(p));

            periods.forEach(period => {
                const subject = period.getLink(Subject);
                if(!subject) return;

                const classroom = period.getLink(Classroom);
                if(!classroom) {
                    throw new Error('No classsroom.');
                }

                const teacher = batch.getLink(Teacher);
                if(!teacher) {
                    throw new Error('No teacher.');
                }

                json.periods.push({
                    period: period.id,
                    classroom: classroom.id,
                    subject: subject.id,
                    teacher: teacher.config.code
                })
            })
        })

        return json;
    }

    getHTML() {
        const prefix = `<script>
            const SCHEDULE = JSON.parse('${JSON.stringify(this.getJSON())}');
            const DATE_TIME = ${Date.now()};
        </script>`;
        return prefix+TEMPLATE_HTML;
    }

    saveHTML() {
        const collectionId = dayjs(new Date()).format('DD-MM-YYYY HH-mm-ss');
        const category = this.person.constructor.name.toLowerCase()+'s';

        const outDirs = [
            path.join(OUT_DIR, collectionId, category),
            path.join(OUT_DIR, 'latest', category)
        ];

        outDirs.forEach(outDir => {
            if(!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            const outFilename = `${this.person.id}.html`;
            const outPath = path.resolve(outDir, outFilename);
            
            fs.writeFileSync(outPath, this.getHTML());
        })
    }
}