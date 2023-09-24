import Input from './Input';
import _ from 'lodash';

export default class Config {
    static get(keypath: string) {
        const value = _.get(Input.get('config'), keypath);

        if(typeof value == 'undefined') {
            throw new Error(`Config item '${keypath}' is undefined.`);
        }

        return value;
    }
}