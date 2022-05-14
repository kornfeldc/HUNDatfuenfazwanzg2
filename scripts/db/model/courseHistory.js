class CourseHistory extends BaseModel {

    constructor() {
        super("courseHistory")
        this.id="_";
        this.personId = null;
        this.courses = 0;
        this.date = moment().format(util.dateFormat);
        
        this.map = [
            "id","personId", "courses", "date"
        ];
    }

    static getList() {
        return new Promise(resolve => {
            api.get("courseHistory").then(result => {
                resolve(this.fromArray(CourseHistory, result));
            });
        });
    }

    static get(id) {
        return super.get("courseHistory", CourseHistory, id);
    }

    static sort(courseHistories, p) {
        return courseHistories;
        // return sales.sort((sale1,sale2) => {
        //      var sortProperty = "title";
        //      return sale1[sortProperty] < sale2[sortProperty] ? -1 : sale1[sortProperty] > sale2[sortProperty] ? 1 : 0;
        // });
    }

    static getFiltered(courseHistories, p) {
        var ret = courseHistories.filter(courseHistory => {
            var x = true;

            //filter by tab
            // if(p.tab) 
            //     x = x && ((p.tab === "favorites" && article.isFavorite === 1) || article.type === p.tab);
            // x = x && util.search(article.title, p.search);
            return x;
        });

        return this.sort(ret, p);
    }
    
    static async remove(id, personId) {
        const courseHistory = new CourseHistory();
        courseHistory.id = id;
        await courseHistory.remove({ personId });
    }
}