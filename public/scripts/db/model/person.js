class Person extends BaseModel {

    constructor() {
        super("person")
        this.id="_";
        this.firstName = "";
        this.lastName = "";
        this.isMember = false;
        this.mainPersonId = null;
        this.personGroup = "";
        this.credit = 0;
        this.courseCount = 0;
        this.phone = "";
        this.email = "";
        this.saleCount = 0;//do not map, only used in personchooser
        this.saleCountActive = 0;//do not map, only used in personchooser
        this.saleSum = 0;//do not map, only used in personchooser
        this.relatedNames = ""; //do not map, only used in personChooser
        this.courseHistoryCount = 0; // do not map
        this.lastBookedCourse = null; // do not map
        this.extId = "";
        this.isActive = true;

        this.map = ["id","firstName", "lastName", "isMember", "mainPersonId", "personGroup", "credit", "courseCount", "phone", "email", "extId", "isActive"];
    }

    get fullName() {
        return this.lastName + " " + this.firstName;
    }

    get nameWithGroup() {
        if(this.personGroup && this.personGroup.length > 0)
            return this.personGroup;
        return this.fullName;
    }

    get isMainPerson() {
        return (!this.mainPersonId || this.mainPersonId === this.id);
    }

    matchSearch(str) {
        return (
            util.search(this.firstName, str) || 
            util.search(this.lastName, str) || 
            util.search(this.personGroup, str) || 
            util.search(this.relatedNames, str)
        );
    }

    static getList() {
        return new Promise(resolve => {
            api.get("person").then(result => {
                resolve(this.fromArray(Person, result));
            });
        });
    }

    static get(id) {
        return super.get("person", Person, id);
    }

    static sort(persons, p) {
        return persons.sort((person1,person2) => {
            var sortProperty = "fullName"
            var inv = 1;
            if(p && p.tab === "top") {
                sortProperty = "saleCountActive";
                inv = -1;
            }
            return person1[sortProperty] < person2[sortProperty] ? -1*inv : person1[sortProperty] > person2[sortProperty] ? 1*inv : 0;
        });
    }

    static getFiltered(persons, p) {
        var ret = persons.filter(person => {
            
            if(p.chooser && person.mainPersonId && person.mainPersonId != person.id)
                return false;

            var x = true;
            if(p.tab)
                x = x && (
                    p.tab === "all" || p.tab === "inactive" ||
                    (p.tab === "member" && person.isMember) ||
                    (p.tab === "nomember" && !person.isMember) ||
                    (p.tab === "top" && person.saleCountActive > 0) ||
                    (p.tab === "course" && person.courseHistoryCount > 0)
                );

            if(p.search && p.search.length > 1 && person.matchSearch(p.search))
                return true;

            if((!p.search || p.search.length == 0)) //in chooser show only active (when not searched directly)
                x = x && ((p.tab === "inactive" && !person.isActive) || (p.tab !== "inactive" && person.isActive));

            x = x && person.matchSearch(p.search);
            return x;
        });

        return this.sort(ret, p);
    }    

    static async getHistory(personId) {
        var result = await api.get("history", { personId});
        return result;
    }

    static async getCourseHistory(personId) {
        var result = await api.get("courseHistory", { personId});
        return result;
    }
}

const barPerson = {
    id: -1,
    fullName: "Barverkauf",
    nameWithGroup: "Barverkauf",
    isBar: true,
    credit: 0
};