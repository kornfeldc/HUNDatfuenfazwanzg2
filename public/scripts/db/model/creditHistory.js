class CreditHistory extends BaseModel {

    constructor() {
        super("creditHistory")
        this.id="_";
        this.personId = null;
        this.credit = 0;
        this.isBought = false;
        this.saleId = null;
        this.date = moment().format(util.dateFormat);
        
        this.map = [
            "id","personId", "credit", "isBought", "saleId", "date"
        ];
    }

    /*
    static getList() {
        return new Promise(resolve => {
            api.get("creditHistory").then(result => {
                resolve(this.fromArray(CreditHistory, result));
            });
        });
    }
    
    static get(id) {
        return super.get("creditHistory", CreditHistory, id);
    }
    
    static sort(creditHistories, p) {
        return creditHistories;
        // return sales.sort((sale1,sale2) => {
        //      var sortProperty = "title";
        //      return sale1[sortProperty] < sale2[sortProperty] ? -1 : sale1[sortProperty] > sale2[sortProperty] ? 1 : 0;
        // });
    }
    
    static getFiltered(creditHistories, p) {
        var ret = creditHistories.filter(creditHistory => {
            var x = true;

            //filter by tab
            // if(p.tab) 
            //     x = x && ((p.tab === "favorites" && article.isFavorite === 1) || article.type === p.tab);
            // x = x && util.search(article.title, p.search);
            return x;
        });

        return this.sort(ret, p);
    }
    */
}