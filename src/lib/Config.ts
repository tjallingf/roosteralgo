import Input from './Input';

export default class Config {
    static get(item) {
        return Input.get('config')[item];
    }
}