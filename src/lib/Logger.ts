// import { createLogger, addColors, format, transports } from 'winston';
// import * as _ from 'lodash';
// const  { combine, errors, simple, colorize, timestamp, printf } = format;
const dayjs = require('dayjs');
const kolorist = require('kolorist');
const _ = require('lodash');

class LoggerClass {
    defaultOptions = {
        level: 'info',
        label: 'System'
    }

    colors = {
        error: kolorist.red,
        warn: kolorist.yellow,
        notice: kolorist.blue,
        info: kolorist.green,
        debug: kolorist.magenta
    }

    constructor(defaultOptions = null) {
        if(defaultOptions) {
            this.defaultOptions = defaultOptions;
        }
    }

    child(defaultOptions) {
        return new LoggerClass(defaultOptions);
    }

    print(data, options) {
        options = _.defaults(options, this.defaultOptions);
        const line: any[] = [];
        let message: string;

        // MESSAGE
        if(data instanceof Error) {           
            // Only log the error message
            message = data.message;
        } else {
            message = data;
        }

        // TIME
        const time = this.getTimeString();
        line.push(time);

        // LABEL
        const label = _.trimEnd(_.trimStart(options.label, '['), ']');
        line.push('['+label+']');

        // LEVEL
        const level = this.colors[options.level](options.level);
        line.push(level+':');
        
        // MESSAGE
        line.push(message);

        // META
        if(options.meta) {
            const meta = JSON.stringify(options.meta);
            line.push(meta);
        }

        console.log(line.join(' '));

        // Log error stack
        if(process.env.NODE_ENV === 'development') {
            if(data instanceof Error && data.stack && process.env.NODE_ENV === 'development') {
                console.error(data.stack);
            } else if(options.err instanceof Error && options.err.stack) {
                console.error(options.err.stack);
            }
        }
    }

    getTimeString() {
        return kolorist.italic(kolorist.gray(dayjs().format('HH:mm:ss.SSS')));
    }

    error(message: any, options = {}) {
        this.print(message, { ...options, level: 'error' });
    }

    warn(message: any, options = {}) {
        this.print(message, { ...options, level: 'warn' });
    }

    info(message: any, options = {}) {
        this.print(message, { ...options, level: 'info' });
    }

    notice(message: any, options = {}) {
        this.print(message, { ...options, level: 'notice' });
    }

    debug(message: any, options = {}) {
        this.print(message, { ...options, level: 'debug' });
    }
}

const Logger = new LoggerClass();
export default Logger;