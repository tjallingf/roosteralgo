import Input from './Input';
import _ from 'lodash';

export default class Config {
    static get(keypath: string) {
        return _.get(Input.get('config'), keypath);
    }
}