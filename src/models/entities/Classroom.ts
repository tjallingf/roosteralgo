import EntityWithAvailability from '../EntityWithAvailability';
import { forIn } from 'lodash';
import Subject from './Subject';
import Context from '../../lib/Context';

export interface ClassroomConfig {
    id: string,
    fitness: Array<
        [
            {
                teacher?: string,
                subjects?: string[] | '*',
                year?: number | number[]
            },
            number
        ]
    >
}

export default class Classroom extends EntityWithAvailability<ClassroomConfig> {
    init() {
        if(this.config.fitness?.length) {
            this.config.fitness.forEach(([ condition, value ]) => {
                if(Array.isArray(condition.subjects)) {
                    // If the subject selector is an array, link the classroom to the selected subjects
                    condition.subjects.forEach(subjectId => {
                        const subject = $subjects.get(subjectId);
                        subject.linkTo(this);
                    })
                } else if(condition.subjects === '*') {
                    // If the subject selector is a wildcard (*), link the classroom to all available subjects
                    $subjects.all().forEach(subject => {
                        subject.linkTo(this);
                    })
                }
            })
        }

        $logger.debug(`Linked classroom ${this.config.id} to ${this.getLinks(Subject).length} subjects. (${this.getLinks(Subject).map(s => s.id).join(', ')}).`)
    }

    getFitness(context: Context) {
        return context.match(this.config.fitness);
    }
}