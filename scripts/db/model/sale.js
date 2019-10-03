class Sale extends BaseModel {

    constructor() {
        super("sale")
        this.id="_";
        this.personId = null;
        this.personName = "";
        this.saleDate = null;
        this.payDate = null;
        this.toPay = 0;
        this.toReturn = 0;
        this.inclTip = 0;
        this.given = 0;
        this.articlesum = 0;
        this.addAdditionalCredit = 0;
        this.usedCredit = false;

        this.articles = [];

        this.map = [
            "id","personId", "personName", "saleDate", "payDate", "toPay",
            "toReturn", "inclTip", "given", "articleSum", "addAdditionalCredit", "usedCredit"
        ];
    }

    get isPayed() {
        return this.payDate !== null;
    }

    get isToday() {
        return this.saleDate  === moment().format("DD.MM.YYYY");
    }

    get isAct() {
        return this.isToday || !this.isPayed;
    }

    get salePayDateDay() {
        if(this.payDate !== null)
            return moment(this.payDate,"DD.MM.YYYY").format("DD.MM.YYYY");
        return "";
    }

    get saleDateDay() {
        return moment(this.saleDate,"DD.MM.YYYY").format("DD.MM.YYYY");
    }

    get saleDateAsNr() {
        return parseInt(moment(this.saleDate, "DD.MM.YYYY").format("YYYYMMDD"),10);
    }

    setPerson(person) {
        this.personId = person.id;
        this.personName = person.nameWithGroup || person.fullName;
    }

    calculate() {
        var _this = this;
        var copy = JSON.parse(JSON.stringify(_this.articles));
        _this.articles = [];
        copy.filter(c => c.amount > 0).forEach(c => _this.articles.push(c));
        _this.articleSum = 0;
        _this.articles.forEach(a => _this.articleSum += a.articlePrice * a.amount);
    }

    static getOpenedSaleForPerson(person) {
        var _this = this;
        return new Promise((resolve,reject) => {
            resolve(null);
            // _this.getList().then(allSales => {
            //     var sale = allSales.find(sale => !sale.isPayed && sale.person._id === person._id);
            //     resolve(sale);
            // });
        });
    }

    static getList(p) {
        return new Promise(resolve => {
            api.get("sale", p).then(result => {
                var sales = this.fromArray(Sale, result);
                if(p && p.loadArticles) {
                    SaleArticle.getList(p).then(saleArticles => {
                        sales.forEach(sale => { 
                            var sas = saleArticles.filter(sa => sa.saleId == sale.id);
                            sale.articles = [];
                            sas.forEach(sa => {
                                sale.articles.push({
                                    article: {
                                        id: sa.articleId,
                                        title: sa.articleTitle,
                                        price: sa.articlePrice
                                    },
                                    amount: sa.amount
                                });
                            });

                            sale.articles = saleArticles.filter(sa => sa.saleId == sale.id);
                        });
                        resolve(sales);
                    });
                }
                else
                    resolve(sales);
            });
        });
    }

    static get(id) {
        return super.get("sale", Sale, id);
    }

    static sort(sales, p) {
        return sales;
        // return sales.sort((sale1,sale2) => {
        //      var sortProperty = "title";
        //      return sale1[sortProperty] < sale2[sortProperty] ? -1 : sale1[sortProperty] > sale2[sortProperty] ? 1 : 0;
        // });
    }

    static getFiltered(sales, p) {
        var ret = sales.filter(sale => {
            var x = true;

            //filter by tab
            // if(p.tab) 
            //     x = x && ((p.tab === "favorites" && article.isFavorite === 1) || article.type === p.tab);
            // x = x && util.search(article.title, p.search);
            return x;
        });

        return this.sort(ret, p);
    }

    
}