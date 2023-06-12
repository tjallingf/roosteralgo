const EssentialEntity = require('./EssentialEntity');

module.exports = class Classroom extends EssentialEntity {
    getScore(context) {
        const { teacher, subject, batch, time } = context;

        this.config.scores.forEach(([ condition, score ]) => {
            
        })
    }
}