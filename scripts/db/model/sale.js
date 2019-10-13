class Sale extends BaseModel {

    constructor() {
        super("sale")
        this.id="_";
        this.personId = null;
        this.personName = "";
        this.saleDate = moment().format(util.dateFormat);
        this.payDate = null;
        this.toPay = 0;
        this.toReturn = 0;
        this.inclTip = 0;
        this.given = 0;
        this.articlesum = 0;
        this.addAdditionalCredit = 0;
        this.usedCredit = false;
        this.extId = "";
        this.articles = [];

        this.map = [
            "id","personId", "personName", "saleDate", "payDate", "toPay",
            "toReturn", "inclTip", "given", "articleSum", "addAdditionalCredit", "usedCredit",
            "extId"
        ];
    }

    get isPayed() {
        return this.payDate !== null && this.payDate !== undefined;
    }

    get isToday() {
        return this.saleDate  === moment().format(util.dateFormat);
    }

    get isAct() {
        return this.isToday || !this.isPayed;
    }

    get salePayDateDay() {
        if(this.payDate !== null)
            return moment(this.payDate,util.dateFormat).format("DD.MM.YYYY");
        return "";
    }

    get saleDateDay() {
        return moment(this.saleDate,util.dateFormat).format("DD.MM.YYYY");
    }

    get saleDateAsNr() {
        return parseInt(moment(this.saleDate, util.dateFormat).format("YYYYMMDD"),10);
    }

    setPerson(person) {
        this.personId = person.id;
        this.personName = person.nameWithGroup || person.fullName;
    }

    calculate() {
        var _this = this;
        
        var copy = JSON.parse(JSON.stringify(_this.articles));
        _this.articles = [];
        copy.filter(c => /*c.amount > 0*/true /*=> copy all; 0 amounts will be removed on save*/).forEach(c => _this.articles.push(c));
        _this.articleSum = 0;
        _this.articles.forEach(a => _this.articleSum += a.article.price * a.amount);
    }

    save() {
        var _this = this;
        return new Promise((resolve) => {
            super.save().then(result => {
                var id = result.id || _this.id;
                util.log("saved sale - saleId: ", id);
                var articlePromises = [];
                for(var i = 0; i < _this.articles.length; i++) {
                    var a = _this.articles[i];
                    util.log("try to parse article to SaleArticle", a);
                    var sa = SaleArticle.fromSaleArticle(a.article,a.amount,a.id,id);
                    util.log("parsed", sa);

                    var promise = sa.save({ blockCalculation: i < _this.articles.length -1 ? -1 : 0 });
                    articlePromises.push(promise);
                }

                Promise.all(articlePromises).then(() => {
                    resolve(result);        
                });
            });
        });
    }

    static async getOpenedSaleForPerson(person) {
        var result = await api.get("sale", { openedSaleForPersonId: person.id });
        if(result && result.length > 0) {
            var sale = this.fromArray(Sale, result)[0];

            var saleArticles = await SaleArticle.getList({ saleId: sale.id});
            sale.articles = [];
            saleArticles.forEach(sa => sale.articles.push(Sale.parseSaleArticleForSale(sa)));
            return sale;
        }
        else
            return null;
    }

    static parseSaleArticleForSale(sa) {
        return {
            id: sa.id,
            article: {
                id: sa.articleId,
                title: sa.articleTitle,
                price: sa.articlePrice
            },
            amount: sa.amount
        };
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
                            sas.forEach(sa => sale.articles.push(Sale.parseSaleArticleForSale(sa)));
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
        return new Promise(resolve => {
            super.get("sale", Sale, id).then((sale) => {
                SaleArticle.getList({ saleId: sale.id}).then(saleArticles => {
                    sale.articles = [];
                    saleArticles.forEach(sa => sale.articles.push(Sale.parseSaleArticleForSale(sa)));
                    resolve(sale);
                });
            });
        });
        return super.get("sale", Sale, id);
    }

    static sort(sales, p) {
        var ret = sales;

        ret.sort(
            firstBy("isPayed")
            .thenBy("saleDateAsNr",-1)
            .thenBy("person.personName")
        );

        Sale.addSpecialProperties(ret);
        return ret;
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

    static addSpecialProperties(sales) {
        for(var i = 0; i < sales.length; i++) {
            if(!sales[i].isPayed && i == 0)
                sales[i].isFirstUnpayed = true;
            if(sales[i].isPayed && (i == 0 || !sales[i-1].isPayed))
                sales[i].isFirstPayed = true;
        }
    }

    static getDayList() {
        return new Promise(resolve => {
            api.get("saleDay").then(result => {
                result && result.forEach(d => d.dayText = moment(d.day,util.dateFormat).format("dddd, DD.MM.YYYY"));
                resolve(result);
            });
        });
    }
}