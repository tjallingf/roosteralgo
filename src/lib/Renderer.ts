import * as path from 'node:path';
import * as fs from 'node:fs';
import Schedule from '../Schedule';
import Subject from '../models/entities/Subject';
import Teacher, { TeacherConfig } from '../models/entities/Teacher';
import Classroom from '../models/entities/Classroom';
import dayjs from 'dayjs';
import Student from '../models/entities/Student';
import Batch from '../models/entities/Batch';
import Grade from '../models/Grade';

const OUT_DIR = path.resolve('./renders');
const TEMPLATE_PATH = path.resolve('./src/renderer/template.html');
const TEMPLATE_HTML = fs.readFileSync(TEMPLATE_PATH);

export default class Renderer {
    schedule: Schedule;
    entity: Student | Teacher | Batch | Grade;

    constructor(week: Schedule, person: Student | Teacher | Batch | Grade) {
        this.schedule = week;
        this.entity = person;
    }

    getJSON() {
        // Get the list of relevant batches
        let batches: Batch[] = [];
        if(this.entity instanceof Teacher || this.entity instanceof Student || this.entity instanceof Grade) {
            batches = this.entity.getLinks(Batch);
        } else if(this.entity instanceof Batch) {
            batches = [ this.entity ];
        }

        const json: any = {
            entity: {
                type: this.entity.constructor.name.toLowerCase(),
                id: this.entity.id
            },
            meta: {
                entities: {
                    batch: $batches.all().map(b => b.id),
                    period: $periods.allSorted().map(p => p.id),
                    teacher: $teachers.all().map(t => t.id),
                    student: $students.all().map(s => s.id),
                    grade: $grades.all().map(g => g.id)
                }
            },
            meetings: []
        }
        
        batches.forEach(batch => {
            batch.getMeetings(this.schedule).forEach(meeting => {
                json.meetings.push({
                    period: meeting.getPeriod()?.id,
                    classroom: meeting.getClassroom()?.id,
                    subject: batch.getSubject().id,
                    teacher: batch.getTeacher().id,
                    teacherCode: batch.getTeacher().config.code,
                    batch: batch.id
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
        const category = this.entity.constructor.name.toLowerCase();
        const id = this.entity.config.id;

        const outDirs = [
            path.join(OUT_DIR, collectionId, category),
            path.join(OUT_DIR, 'latest', category)
        ];

        outDirs.forEach(outDir => {
            if(!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            const outFilename = `${id}.html`;
            const outPath = path.resolve(outDir, outFilename);
            
            fs.writeFileSync(outPath, this.getHTML());
        })
    }
}