const _items = [];

const groups = {
    get: function(predicate) {
        return _items.find(predicate);
    },

    init: function() {

    }
}

export default groups;