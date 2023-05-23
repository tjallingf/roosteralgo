const Input = require('./Input');

module.exports = class Config {
    static get(item) {
        return Input.get('config')[item];
    }
}