module.exports = class Group {
    _preferredSubjects = [];

    addPreferredSubject(flag) {
        this._preferredSubjects.push(flag);
    }
}