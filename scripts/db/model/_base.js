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
        // console.log("save1", _this);
        // console.log("save2", _this.toObj());
        // return new Promise(resolve => {
        //     if(this.doc === null) {
        //         //new
        //         console.log("save - insert", _this.toObj());
        //         _this.db.put(_this.toObj()).then(()=>resolve());
        //     }
        //     else {
        //         console.log("save - update", _this.toDoc());
        //         _this.db.put(_this.toDoc()).then(()=>resolve());
        //     }
        // }); 
    }

    remove() {
        //return this.db.remove(this.doc);
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