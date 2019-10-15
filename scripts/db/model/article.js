class Article extends BaseModel {

    constructor() {
        super("article")
        this.id="_";
        this.title = "";
        this.type = "";
        this.price = 0.0;
        this.isFavorite = false;
        this.countForPerson = 0;//do not map, only used in articlechooser
        this.extId = "";
        this.isActive = true;

        this.map = ["id","title", "type", "price", "isFavorite", "extId", "isActive"];
    }

    static getTypes() {
        return [
            { id: "alcoholic", title: "Getränk - Alkoholisch", shortTitle: "Alk." },
            { id: "nonalcoholic", title: "Getränk - Antialkoholisch", shortTitle: "Antialk." },
            { id: "snack", title: "Snacks und Jause", shortTitle: "Snacks" },
            { id: "sweet", title: "Süßes & Mehlspeise", shortTitle: "Süßes" },
            { id: "meal", title: "Mahlzeit", shortTitle: "Mahlzeit" }
        ];
    }

    static getList(p) {
        return new Promise(resolve => {
            api.get("article").then(result => {
                if(p && p.personId) {
                    api.get("personArticleUsage", p).then(personArticleUsages => {
                        var ret = this.fromArray(Article, result);
                        if(personArticleUsages) {
                            personArticleUsages.forEach(pau => {
                                var a = ret.find(a => a.id == pau.articleId);
                                if(a) a.countForPerson = pau.amount;
                            });
                        }
                        resolve(ret);
                    });
                }
                else
                    resolve(this.fromArray(Article, result));
            });
        });
    }

    static get(id) {
        return super.get("article", Article, id);
    }

    static sort(articles, p) {
        if(p.tab == "top")
            return articles.sort(firstBy("countForPerson", { direction:-1}).thenBy("title", {ignoreCase:true }));
        return articles.sort(firstBy("title", {ignoreCase:true }));
    }

    static getFiltered(articles, p) {

        //todo: p.person

        var ret = articles.filter(article => {
            var x = true;

            //filter by tab
            if(p.tab) 
                x = x && (
                    p.tab === "all" || p.tab === "inactive" ||
                    (p.tab === "favorites" && article.isFavorite === 1) || 
                    (p.tab == "top" && (article.countForPerson > 0 || article.isFavorite === 1)) ||
                    article.type === p.tab 
                );

            if(p.search && p.search.length > 1 && util.search(article.title, p.search))
                return true;

            x = x && ((p.tab === "inactive" && !article.isActive) || (p.tab !== "inactive" && article.isActive));                
            x = x && util.search(article.title, p.search);
            return x;
        });

        return this.sort(ret, p);
    }
}