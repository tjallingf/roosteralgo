import ControllerClass from '../lib/ControllerClass';

export default class subjects extends (new ControllerClass()) {
    getByFlag(flag) {
        return this.getById(flag+'');
    }
}