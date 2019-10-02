class SaleArticle extends BaseModel {

    constructor() {
        super("sale")
        this.id="_";
        this.articleId = null;
        this.articleTitle = "";
        this.articlePrice = 0;
        this.saleId = null;
        this.amount = 0;
        
        this.map = ["id","articleId", "articleTitle", "articlePrice", "amount", "saleId"];
    }

    static getList() {
        return new Promise(resolve => {
            api.get("saleArticle").then(result => {
                resolve(this.fromArray(SaleArticle, result));
            });
        });
    }

    static get(id) {
        return super.get("saleArticle", SaleArticle, id);
    }

    static sort(saleArticles, p) {
        return saleArticles;
        // return sales.sort((sale1,sale2) => {
        //      var sortProperty = "title";
        //      return sale1[sortProperty] < sale2[sortProperty] ? -1 : sale1[sortProperty] > sale2[sortProperty] ? 1 : 0;
        // });
    }

    static getFiltered(saleArticles, p) {
        var ret = saleArticles.filter(saleArticle => {
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