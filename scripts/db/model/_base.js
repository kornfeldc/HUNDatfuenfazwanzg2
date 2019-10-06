class BaseModel {
    constructor(endpoint) {
        this.map = [];
        this.endpoint = endpoint;
    }

    checkMap() {
        if(this.map.length == 0)
            alert("no map set for object");
        if(!this.map.includes("id"))
            this.map.push("id");
    }

    toObj() {
        this.checkMap();
        var ret = {};
        this.map.forEach(property => ret[property] = this[property]);
        return ret;
    }

    save() {
        var _this = this;
        return new Promise((resolve,reject) => {
            var obj = {};
            this.map.forEach(property => obj[property] = this[property]);
            api.set(_this.endpoint, obj).then((result) => {
                resolve(result);
            });
        });
    }

    remove() {
        var _this = this;
        return new Promise((resolve,reject) => {
            var obj = { id: _this.id, delete: 1 };
            api.set(_this.endpoint, obj).then((result) => {
                resolve(result);
            });
        });
    }

    static get(endpoint, cls, id) {
        return new Promise(resolve => {
            api.get(endpoint,{id}).then(result => {
                resolve(this.fromObject(cls, result));
            });
        });
    }

    static fromObject(cls, obj) {
        var entity = new cls();
        entity = $.extend(entity,obj);
        return entity;
    }

    static fromArray(cls, arr) {
        var ret = [];
        arr.forEach(obj => ret.push(this.fromObject(cls,obj)));
        return ret;
    }
}