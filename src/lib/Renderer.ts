import * as path from 'node:path';
import * as fs from 'node:fs';
import Schedule from '../Schedule';
import Subject from '../models/entities/Subject';
import Teacher from '../models/entities/Teacher';
import Classroom from '../models/entities/Classroom';
import dayjs from 'dayjs';

const OUT_DIR = path.resolve('./renders');
const TEMPLATE_PATH = path.resolve('./src/renderer/template.html');
const TEMPLATE_HTML = fs.readFileSync(TEMPLATE_PATH);

export default class Renderer {
    schedule: Schedule;

    constructor(schedule: Schedule) {
        this.schedule = schedule;
    }

    getJSON() {
        const json: any = {
            id: this.schedule.student.config.name,
            meta: {
                periods: $periods.meta,
                periodDistrib: $periods.allSortedByMedianDistance().filter(p => p.config.id < 8).map(p => p.id)
            },
            periods: []
        }

        this.schedule.periods.all().forEach(period => {
            const subject = period.getLink(Subject);
            if(!subject) return;

            const classroom = period.getLink(Classroom);
            if(!classroom) {
                throw new Error('No classsroom.');
            }
            
            const teacher = period.getLink(Teacher);
            if(!teacher) {
                throw new Error('No teacher.');
            }

            json.periods.push({
                period: period.id,
                // classroom: classroom.id,
                subject: subject.id,
                // teacher: teacher.config.code
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
        const outDirs = [
            path.join(OUT_DIR, collectionId, 'students'),
            path.join(OUT_DIR, 'latest', 'students')
        ];

        outDirs.forEach(outDir => {
            if(!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            const outFilename = `${this.schedule.student.id}.html`;
            const outPath = path.resolve(outDir, outFilename);
            
            fs.writeFileSync(outPath, this.getHTML());
        })
    }
}