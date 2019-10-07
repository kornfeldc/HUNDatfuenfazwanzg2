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
        this.phone = "";
        this.email = "";
        this.saleCount = 0;//do not map, only used in personchooser
        this.saleSum = 0;//do not map, only used in personchooser
        this.relatedNames = ""; //do not map, only used in personChooser
        
        this.map = ["id","firstName", "lastName", "isMember", "mainPersonId", "personGroup", "credit", "phone", "email"];
    }

    get fullName() {
        return this.lastName + " " + this.firstName;
    }

    get nameWithGroup() {
        if(this.personGroup && this.personGroup.length > 0)
            return this.personGroup;
        return this.fullName;
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
            if(p && p.tab === "top")
                sortProperty = "topSaleCount";
            return person1[sortProperty] < person2[sortProperty] ? -1 : person1[sortProperty] > person2[sortProperty] ? 1 : 0;
        });
    }

    static getFiltered(persons, p) {
        var ret = persons.filter(person => {
            
            if(p.chooser && person.mainPersonId != person.id) 
                return false;

            var x = true;
            if(p.tab)
                x = x && (
                    p.tab === "all" ||
                    (p.tab === "member" && person.isMember) ||
                    (p.tab === "nomember" && !person.isMember) ||
                    (p.tab === "top" && person.topSaleCount > 0)
                );
            x = x && person.matchSearch(p.search);
            return x;
        });

        return this.sort(ret, p);
    }    
}

const barPerson = {
    id: -1,
    fullName: "Barverkauf",
    nameWithGroup: "Barverkauf",
    isBar: true,
    credit: 0
};