class RobCoursePerson extends BaseModel {

    constructor() {      
        super("robCoursePerson")
        this.id="_";
        this.timestamp = null;
        this.personName = null;
        this.dogName = null;
        this.map = ["id"," timestamp", "personName", "dogName"];
    }

    static getList(robCourseId) {
        return new Promise(resolve => {
            api.get("robCoursePerson", { id: robCourseId }).then(result => {
                resolve(this.fromArray(RobCoursePerson, result));
            });
        });
    }
}