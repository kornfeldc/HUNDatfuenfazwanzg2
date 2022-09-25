class RobCourse extends BaseModel {

    constructor() {      
        super("robCourse")
        this.id="_";
        this.date = this.getNextDate().format(util.dateFormat);
        this.maxPersons = this.getMaxPersons();
        this.link = "";
        this.personCount = 0;
        this.map = ["id","maxPersons", "link", "date", "personCount"];
    }

    async generateLink() {
        this.link = await this.getLink();
    }

    getNextDate() {
        const weekday = 2;
        var date = moment().isoWeekday(weekday);
        if(date.isBefore(moment()))
            date = moment().add(7,"days").isoWeekday(weekday);
        return date;
    }

    getMaxPersons() {
        return 6;
    }

    async getLink(length = 6) {
        var result           = '';
        var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        var exists = await RobCourse.linkExists(result);
        if(exists) return await this.getLink();
        return result;
    }

    static async linkExists(link) {
        var result = await api.get("robCourse");
        const rcs = this.fromArray(RobCourse, result);
        return rcs.find(x => x.link === link);
    }

    static getList(p) {
        return new Promise(resolve => {
            api.get("robCourse").then(result => {
                resolve(this.fromArray(RobCourse, result));
            });
        });
    }

    static get(id) {
        return super.get("robCourse", RobCourse, id);
    }
    
}