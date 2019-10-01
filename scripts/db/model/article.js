class Article extends BaseModel {

    constructor() {
        super("article")
        this.id="_";
        this.title = "";
        this.type = "";
        this.price = 0.0;
        this.isFavorite = false;

        this.map = ["id","title", "type", "price", "isFavorite"];
    }

    static getTypes() {
        return [
            { id: "alcoholic", title: "Getränk - Alkoholisch", shortTitle: "Alk." },
            { id: "nonalcoholic", title: "Getränk - Antialkoholisch", shortTitle: "Antialk." },
            { id: "snack", title: "Snack", shortTitle: "Snacks" }
        ];
    }

    static getList() {
        return new Promise(resolve => {
            api.get("article").then(result => {
                resolve(this.fromArray(Article, result));
            });
        });
    }

    static get(id) {
        return super.get("article", Article, id);
    }

    static sort(articles, p) {
        return articles.sort((article1,article2) => {
            var sortProperty = "title";
            return article1[sortProperty] < article2[sortProperty] ? -1 : article1[sortProperty] > article2[sortProperty] ? 1 : 0;
        });
    }

    static getFiltered(articles, p) {
        var ret = articles.filter(article => {
            var x = true;

            //filter by tab
            if(p.tab) 
                x = x && ((p.tab === "favorites" && article.isFavorite === 1) || article.type === p.tab);
            x = x && util.search(article.title, p.search);
            return x;
        });

        return this.sort(ret, p);
    }
}